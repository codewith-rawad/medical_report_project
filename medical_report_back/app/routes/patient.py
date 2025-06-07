from flask import Blueprint, request, jsonify
from app import mongo  # تأكد من أن لديك MongoDB مهيأ في app/__init__.py
from math import ceil
from bson import ObjectId  # ضروري لتحويل str إلى ObjectId في MongoDB

patient_bp = Blueprint('patient', __name__)

# 📌 إضافة مريض جديد
@patient_bp.route('/patients', methods=['POST'])
def add_patient():
    data = request.get_json()
    doctor_id = data.get('doctor_id')
    name = data.get('name')
    age = data.get('age')
    address = data.get('address')
    medical_cases = data.get('medical_cases', [])

    if not doctor_id or not name or not age:
        return jsonify({"message": "Doctor ID, Name, and Age are required"}), 400

    new_patient = {
        "doctor_id": doctor_id,
        "name": name,
        "age": age,
        "address": address,
        "medical_cases": medical_cases
    }

    try:
        mongo.db.patients.insert_one(new_patient)
        return jsonify({"message": "Patient added successfully"}), 201
    except Exception as e:
        return jsonify({"message": "Failed to add patient", "error": str(e)}), 500

# 📌 جلب المرضى مع Pagination
@patient_bp.route('/patients', methods=['GET'])
def get_patients():
    doctor_id = request.args.get('doctor_id')
    if not doctor_id:
        return jsonify({"message": "Doctor ID is required"}), 400

    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 2))  # يمكنك تعديل الرقم هنا حسب الحاجة
        if page < 1 or limit < 1:
            raise ValueError()
    except ValueError:
        return jsonify({"message": "Page and limit must be positive integers"}), 400

    try:
        total_patients = mongo.db.patients.count_documents({"doctor_id": doctor_id})
        total_pages = ceil(total_patients / limit)
        skip = (page - 1) * limit

        patients_cursor = mongo.db.patients.find({"doctor_id": doctor_id}).skip(skip).limit(limit)
        patients = []
        for patient in patients_cursor:
            patients.append({
                "_id": str(patient["_id"]),
                "name": patient.get("name"),
                "age": patient.get("age"),
                "address": patient.get("address"),
                "medical_cases": patient.get("medical_cases", [])
            })

        return jsonify({
            "patients": patients,
            "page": page,
            "limit": limit,
            "total_patients": total_patients,
            "total_pages": total_pages
        }), 200

    except Exception as e:
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500


@patient_bp.route('/patients/<patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    try:
        result = mongo.db.patients.delete_one({"_id": ObjectId(patient_id)})
        if result.deleted_count == 0:
            return jsonify({"message": "Patient not found"}), 404
        return jsonify({"message": "Patient deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": "Failed to delete patient", "error": str(e)}), 500
