from flask import Blueprint, request, jsonify
from app.models.report_model import Report

report_bp = Blueprint('report', __name__)


@report_bp.route('/api/report', methods=['POST'])
def create_report():
    data = request.get_json()
    new_report = Report(
        user_id=data['user_id'],
        image_url=data['image_url'],
        report_text=data['report_text']
    )
    
    
    new_report.save()
    return jsonify({"message": "Report created successfully"}), 201
