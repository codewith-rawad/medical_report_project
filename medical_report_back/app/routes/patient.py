from flask import Blueprint, request, jsonify
from app import mongo  # استيراد mongo من ملف __init__.py أو مكان تهيئة التطبيق

patient_bp = Blueprint('patient', __name__)

# 📌 إضافة مريض جديد (POST)
@patient_bp.route('/patients', methods=['POST'])
def add_patient():
    data = request.get_json()

    doctor_id = data.get('doctor_id')
    name = data.get('name')
    age = data.get('age')
    address = data.get('address')
    medical_cases = data.get('medical_cases', [])

    if not doctor_id or not name or not age:
        return jsonify({"message": "Doctor ID, Name and Age are required"}), 400

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
        print("❌ Error adding patient:", e)
        return jsonify({"message": "Failed to add patient", "error": str(e)}), 500

# 📌 جلب المرضى المرتبطين بطبيب (GET)
@patient_bp.route('/patients', methods=['GET'])
def get_patients():
    doctor_id = request.args.get('doctor_id')
    if not doctor_id:
        return jsonify({"message": "Doctor ID is required"}), 400

    try:
        patients_cursor = mongo.db.patients.find({"doctor_id": doctor_id})

        patients = []
        for patient in patients_cursor:
            patients.append({
                "_id": str(patient["_id"]),
                "name": patient.get("name"),
                "age": patient.get("age"),
                "address": patient.get("address"),
                "medical_cases": patient.get("medical_cases", [])
            })

        return jsonify(patients), 200

    except Exception as e:
        print("❌ Error fetching patients:", e)
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500
