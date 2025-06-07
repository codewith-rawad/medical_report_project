from flask import Blueprint, request, jsonify
import google.generativeai as genai
import json

nlp_bp = Blueprint('nlp', __name__)

genai.configure(api_key="AIzaSyDzLEvTu38M9E67pG5crEvYVSy04mO2NGM")
gemini_model = genai.GenerativeModel("gemini-1.5-flash")

@nlp_bp.route('/parse_patient_info', methods=['POST'])
def parse_patient_info():
    data = request.get_json()
    if not data or 'transcript' not in data:
        return jsonify({'message': 'Transcript is required'}), 400

    transcript = data['transcript']

    prompt = (
        "You are an assistant that extracts patient data from a medical voice transcript.\n"
        "Given the following transcript, extract:\n"
        "- Patient's full name (only the name, no extra words)\n"
        "- Age as a number\n"
        "- Clinical case (short description of the medical complaint or symptoms)\n\n"
        "Transcript:\n"
        f"{transcript}\n\n"
        "Respond in JSON format like this:\n"
        "{\n"
        "  \"patient_name\": \"...\",\n"
        "  \"age\": \"...\",\n"
        "  \"clinical_case\": \"...\"\n"
        "}"
    )

    try:
        response = gemini_model.generate_content(prompt)
        content = response.text.strip()

        # تنظيف النص أولًا من علامات Markdown
        cleaned_json = content.replace("```json", "").replace("```", "").strip()

        # محاولة تحويل النص إلى JSON
        parsed = json.loads(cleaned_json)

        # تحويل العمر إلى int إذا كان موجود وصالح
        if parsed.get("age"):
            try:
                parsed["age"] = int(parsed["age"])
            except (ValueError, TypeError):
                pass  # اتركها كما هي لو لم تستطع التحويل

        return jsonify(parsed), 200

    except json.JSONDecodeError:
        return jsonify({"error": "Gemini response is not valid JSON", "raw": content}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
