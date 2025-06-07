from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
from docxtpl import DocxTemplate
import io
import base64
import google.generativeai as genai
from app import mongo
from docx2pdf import convert
import tempfile
import os
import pythoncom

generate_bp = Blueprint('generate', __name__)

# Gemini API Key
genai.configure(api_key="AIzaSyDzLEvTu38M9E67pG5crEvYVSy04mO2NGM")
gemini_model = genai.GenerativeModel("gemini-1.5-flash")

@generate_bp.route('/reports/generate', methods=['POST'])
def generate_report():
    data = request.get_json()
    user_id = data.get("user_id")
    keywords = data.get("keywords")
    transcript = data.get("transcript")  # استقبال الترانسبيت

    if not user_id or not keywords or not transcript:
        return jsonify({"error": "User ID, keywords, and transcript are required"}), 400

    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    user_name = user.get("name", "Unknown User")

    # دمج transcript مع keywords في prompt
    prompt = (
        "You are a professional radiologist. Based on the following medical keywords extracted from a chest X-ray:\n\n"
        + ", ".join(keywords) +
        "\n\nAnd the patient's spoken transcript describing symptoms and history:\n"
        f"{transcript}\n\n"
        "Write a concise medical interpretation minimum 100 words, explaining the findings and suggesting appropriate medications or treatments if applicable. Focus only on clinical relevance. Avoid any disclaimers, introductions, or conversational language."
    )

    pythoncom.CoInitialize()
    try:
        response = gemini_model.generate_content(prompt)
        report_text = response.text.strip()

        template_path = "templates/MEDICAL_REPORT.docx"
        doc = DocxTemplate(template_path)
        context = {
            "patient_name": user_name,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "generated_report": report_text
        }
        doc.render(context)

        with tempfile.TemporaryDirectory() as tmpdirname:
            docx_path = os.path.join(tmpdirname, "report.docx")
            pdf_path = os.path.join(tmpdirname, "report.pdf")

            doc.save(docx_path)

            convert(docx_path, pdf_path)

            with open(docx_path, "rb") as f_docx:
                word_bytes = f_docx.read()
            word_base64 = base64.b64encode(word_bytes).decode("utf-8")

            with open(pdf_path, "rb") as f_pdf:
                pdf_bytes = f_pdf.read()
            pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")

        report_doc = {
            "user_id": ObjectId(user_id),
            "report_text": report_text,
            "docx_base64": word_base64,
            "pdf_base64": pdf_base64,
            "created_at": datetime.utcnow()
        }
        mongo.db.reports.insert_one(report_doc)

        return jsonify({
            "report": report_text,
            "message": "Report generated and saved successfully.",
            "docx_base64": word_base64,
            "pdf_base64": pdf_base64
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        pythoncom.CoUninitialize()
