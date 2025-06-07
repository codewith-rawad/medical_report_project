from flask import Blueprint, request, jsonify
from app.models.MedicalCondition import MedicalCondition
from bson import ObjectId  # إذا تستخدم MongoDB

condition_bp = Blueprint('condition', __name__)

@condition_bp.route('/conditions', methods=['POST'])
def add_condition():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request must be JSON"}), 415

        patient_name = data.get('patient_name')
        age = data.get('age')
        clinical_case = data.get('clinical_case')
        report = data.get('report')
        image_base64 = data.get('image_base64')
        user_id = data.get('user_id')

        if not all([patient_name, age, clinical_case, report, image_base64, user_id]):
            return jsonify({"error": "Missing required fields"}), 400

        condition = MedicalCondition(
            patient_name=patient_name,
            age=age,
            clinical_case=clinical_case,
            report_base64=report,
            image_base64=image_base64,
            user_id=user_id
        )
        condition.save()

        return jsonify({"message": "Medical condition saved successfully"}), 201

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@condition_bp.route('/conditions', methods=['GET'])
def get_conditions():
    try:
        user_id = request.args.get('user_id')
        patient_name = request.args.get('patient_name', '').strip()
        clinical_case = request.args.get('clinical_case', '').strip()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 5))

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        query = {"user_id": user_id}

        if patient_name:
            query["patient_name"] = {"$regex": patient_name, "$options": "i"}
        if clinical_case:
            query["clinical_case"] = {"$regex": clinical_case, "$options": "i"}

        total_count = MedicalCondition.objects(**query).count()
        total_pages = (total_count + limit - 1) // limit

        skip = (page - 1) * limit

        conditions = MedicalCondition.objects(**query).skip(skip).limit(limit).order_by('-created_at')

        result = []
        for cond in conditions:
            result.append({
                "_id": str(cond.id),
                "patient_name": cond.patient_name,
                "age": cond.age,
                "clinical_case": cond.clinical_case,
                "report_base64": cond.report_base64,
                "image_base64": cond.image_base64,
                "created_at": cond.created_at.isoformat() if cond.created_at else None
            })

        return jsonify({
            "conditions": result,
            "total_pages": total_pages,
            "current_page": page,
            "total_count": total_count
        }), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@condition_bp.route('/conditions/<string:condition_id>', methods=['DELETE'])
def delete_condition(condition_id):
    try:
        cond = MedicalCondition.objects(id=ObjectId(condition_id)).first()
        if not cond:
            return jsonify({"error": "Condition not found"}), 404
        cond.delete()
        return jsonify({"message": "Condition deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
