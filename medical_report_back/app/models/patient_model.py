from app import mongo
from datetime import datetime
from bson import ObjectId

class Patient:
    collection = mongo.db.patients

    def __init__(self, doctor_id, name, age, address, medical_cases=None):
        self.doctor_id = ObjectId(doctor_id) 
        self.name = name
        self.age = age
        self.address = address
        self.medical_cases = medical_cases or []
        self.created_at = datetime.utcnow()

    def save(self):
        Patient.collection.insert_one(self.__dict__)

    @staticmethod
    def get_by_doctor(doctor_id):
        return list(Patient.collection.find({"doctor_id": ObjectId(doctor_id)}))

    @staticmethod
    def get_by_id(patient_id):
        return Patient.collection.find_one({"_id": ObjectId(patient_id)})

    @staticmethod
    def delete_by_id(patient_id):
        return Patient.collection.delete_one({"_id": ObjectId(patient_id)})

    @staticmethod
    def add_medical_case(patient_id, medical_case):
        """
        medical_case is a dict containing:
        - report_pdf (string path or base64)
        - medical_image (string path or base64)
        - story (string)
        - date (datetime)
        """
        return Patient.collection.update_one(
            {"_id": ObjectId(patient_id)},
            {"$push": {"medical_cases": medical_case}}
        )
