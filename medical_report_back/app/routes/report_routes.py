from flask import Blueprint, request, jsonify
from bson import ObjectId
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import io
import base64
import requests
from app import mongo

generate_bp = Blueprint('generate', __name__)

OLLAMA_API_URL = " http://ollama.hiast.edu.sy/c/e79cd031-5056-47cb-928a-cab9f02fddc3"
OLLAMA_API_KEY = "sk-fb9946e5eb1f4ecc81c33231a7285cc8"  

@generate_bp.route('/reports/generate', methods=['POST'])
def generate_report():
    data = request.get_json()
    user_id = data.get("user_id")
    keywords = data.get("keywords")

    if not user_id or not keywords:
        return jsonify({"error": "User ID and keywords are required"}), 400

    prompt = (
        "You are an expert radiologist. Based on the following medical keywords extracted from a chest X-ray image:\n\n"
        + ", ".join(keywords) +
        "\n\nGenerate a professional and detailed medical report. Use clear and concise medical language suitable for documentation."
    )

    try:
       
        response = requests.post(
            OLLAMA_API_URL,
            headers={
                "Authorization": f"Bearer {OLLAMA_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama3",  
                "messages": [{"role": "user", "content": prompt}]
            }
        )

        result = response.json()
        print("🔍 LLM Response:", result)
        
        report_text = result['content']

    
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
