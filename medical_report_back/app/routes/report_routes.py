from flask import Blueprint, request, jsonify
from bson import ObjectId
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import io
import base64
import google.generativeai as genai
from app import mongo

generate_bp = Blueprint('generate', __name__)

# Configure Gemini API
genai.configure(api_key="AIzaSyDzLEvTu38M9E67pG5crEvYVSy04mO2NGM")
gemini_model = genai.GenerativeModel("gemini-1.5-flash")

@generate_bp.route('/reports/generate', methods=['POST'])
def generate_report():
    data = request.get_json()
    user_id = data.get("user_id")
    keywords = data.get("keywords")

    if not user_id or not keywords:
        return jsonify({"error": "User ID and keywords are required"}), 400

    # Create prompt for Gemini
    prompt = (
        "You are an expert radiologist. Based on the following medical keywords extracted from a chest X-ray image:\n\n"
        + ", ".join(keywords) +
        "\n\nGenerate a professional, detailed medical report using clear and precise medical language suitable for documentation."
    )

    try:
        # Call Gemini API
        response = gemini_model.generate_content(prompt)
        report_text = response.text.strip()

        # Generate PDF from the report
        pdf_buffer = io.BytesIO()
        p = canvas.Canvas(pdf_buffer, pagesize=A4)
        width, height = A4
        y = height - 50

        for line in report_text.split('\n'):
            p.drawString(40, y, line.strip())
            y -= 18
            if y < 50:
                p.showPage()
                y = height - 50

        p.save()
        pdf_bytes = pdf_buffer.getvalue()
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')

        # Save to MongoDB
        report_doc = {
            "user_id": ObjectId(user_id),
            "report_text": report_text,
            "pdf_base64": pdf_base64
        }
        mongo.db.reports.insert_one(report_doc)

        return jsonify({
            "report": report_text,
            "message": "Report generated and saved successfully."
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
