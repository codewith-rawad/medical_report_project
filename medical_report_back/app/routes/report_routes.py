from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
from docxtpl import DocxTemplate
import io
import base64
import google.generativeai as genai
from app import mongo

generate_bp = Blueprint('generate', __name__)

# Gemini API Key
genai.configure(api_key="AIzaSyDzLEvTu38M9E67pG5crEvYVSy04mO2NGM")
gemini_model = genai.GenerativeModel("gemini-1.5-flash")

@generate_bp.route('/reports/generate', methods=['POST'])
def generate_report():
    data = request.get_json()
    user_id = data.get("user_id")
    keywords = data.get("keywords")

    if not user_id or not keywords:
        return jsonify({"error": "User ID and keywords are required"}), 400

    # جلب اسم المستخدم
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    user_name = user.get("name", "Unknown User")

    # تجهيز البرومبت
    prompt = (
        "You are a professional radiologist. Using the following medical keywords extracted from a chest X-ray:\n\n"
        + ", ".join(keywords) +
        "\n\nGenerate a formal, well-structured chest X-ray medical report. Do not include any disclaimers, questions, or conversational phrases. Do not use asterisks (*). Focus only on clinically relevant findings and conclusions."
    )

    try:
        # توليد التقرير من Gemini
        response = gemini_model.generate_content(prompt)
        report_text = response.text.strip()

        # تحميل القالب وتعبئة البيانات
        template_path = "templates/medical/template.docx"
        doc = DocxTemplate(template_path)
        context = {
            "user_name": user_name,
            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "report_text": report_text
        }
        doc.render(context)

        # حفظ الملف في BytesIO
        word_io = io.BytesIO()
        doc.save(word_io)
        word_bytes = word_io.getvalue()
        word_base64 = base64.b64encode(word_bytes).decode("utf-8")

        # حفظ التقرير في MongoDB
        report_doc = {
            "user_id": ObjectId(user_id),
            "report_text": report_text,
            "docx_base64": word_base64,
            "created_at": datetime.utcnow()
        }
        mongo.db.reports.insert_one(report_doc)

        return jsonify({
            "report": report_text,
            "message": "Report generated and saved successfully."
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
