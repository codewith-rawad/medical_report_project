from flask import Blueprint, request, jsonify
from app.models.MedicalCondition import MedicalCondition
from bson import ObjectId

condition_bp = Blueprint('condition', __name__)

@condition_bp.route('/conditions', methods=['POST'])
def add_condition():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request must be JSON"}), 415

        patient_id = data.get('patient_id')
        patient_name = data.get('patient_name')
        age = data.get('age')
        clinical_case = data.get('clinical_case')
        report = data.get('report')
        image_base64 = data.get('image_base64')
        user_id = data.get('user_id')

        if not all([patient_id, patient_name, age, clinical_case, report, image_base64, user_id]):
            return jsonify({"error": "Missing required fields"}), 400

        condition = MedicalCondition(
            patient_id=patient_id,
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
        patient_id = request.args.get('patient_id', '').strip()
        clinical_case = request.args.get('clinical_case', '').strip()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 4))  # ← ضبط القيمة 4 لتتوافق مع الفرونت

        query = {}

        if patient_id:
            query["patient_id"] = patient_id
        if clinical_case:
            query["clinical_case"] = {"$regex": clinical_case, "$options": "i"}

        total_count = MedicalCondition.collection.count_documents(query)
        total_pages = (total_count + limit - 1) // limit

        skip = (page - 1) * limit

        conditions_cursor = MedicalCondition.collection.find(query).skip(skip).limit(limit).sort('created_at', -1)

        result = []
        for cond in conditions_cursor:
            result.append({
                "_id": str(cond.get('_id')),
                "patient_id": cond.get('patient_id'),
                "patient_name": cond.get('patient_name'),
                "age": cond.get('age'),
                "clinical_case": cond.get('clinical_case'),
                "report_base64": cond.get('report_base64'),
                "image_base64": cond.get('image_base64'),
                "created_at": cond.get('created_at').isoformat() if cond.get('created_at') else None
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
        result = MedicalCondition.delete_by_id(condition_id)
        if result.deleted_count == 0:
            return jsonify({"error": "Condition not found"}), 404
        return jsonify({"message": "Condition deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
