# routes/medical_condition_routes.py
from flask import Blueprint, request, jsonify
from app.models.MedicalCondition import MedicalCondition

condition_bp = Blueprint('condition', __name__)

@condition_bp.route('/conditions', methods=['POST'])
def add_condition():
    data = request.get_json()

    patient_id = data.get('patient_id')
    image_url = data.get('image_url')
    report_url = data.get('report_url')
    story = data.get('story')

    if not patient_id or not image_url or not report_url or not story:
        return jsonify({"message": "Missing required fields"}), 400

    condition = MedicalCondition(
        patient_id=patient_id,
        image_url=image_url,
        report_url=report_url,
        story=story
    )
    condition.save()

    return jsonify({"message": "Medical condition saved successfully"}), 201
