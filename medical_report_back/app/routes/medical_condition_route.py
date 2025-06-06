from flask import Blueprint, request, jsonify
from app.models.MedicalCondition import MedicalCondition
import base64

condition_bp = Blueprint('condition', __name__)

@condition_bp.route('/conditions', methods=['POST'])
def add_condition():
    try:
        data = request.get_json()  # يجب أن يكون Content-Type: application/json

        if not data:
            return jsonify({"error": "Request must be JSON"}), 415

        patient_name = data.get('patient_name')
        age = data.get('age')
        clinical_case = data.get('clinical_case')
        report = data.get('report')
        image_base64 = data.get('image_base64')  # صورة بصيغة base64
        user_id = data.get('user_id')

        # تحقق من الحقول المطلوبة
        if not all([patient_name, age, clinical_case, report, image_base64, user_id]):
            return jsonify({"error": "Missing required fields"}), 400

        # يمكن هنا حفظ الصورة والفحوصات على شكل base64 أو فك ترميزها لحفظها كملف (حسب نموذج MedicalCondition)

        condition = MedicalCondition(
            patient_name=patient_name,
            age=age,
            clinical_case=clinical_case,
            report_base64=report,      # مفترض في النموذج استقبال التقرير بصيغة base64 أو نص عادي
            image_base64=image_base64,
            user_id=user_id
        )
        condition.save()

        return jsonify({"message": "Medical condition saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
