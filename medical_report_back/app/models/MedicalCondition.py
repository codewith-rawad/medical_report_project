from app import mongo
from datetime import datetime
from bson import ObjectId

class MedicalCondition:
    collection = mongo.db.conditions

    def __init__(self, patient_id, patient_name, age, clinical_case, report_base64, image_base64, user_id):
        self.patient_id = patient_id          # معرف المريض
        self.patient_name = patient_name    
        self.age = age                   
        self.clinical_case = clinical_case   
        self.report_base64 = report_base64   
        self.image_base64 = image_base64    
        self.user_id = user_id               
        self.created_at = datetime.utcnow()

    def save(self):
        data = self.__dict__.copy()
        if '_id' in data:
            del data['_id']
        MedicalCondition.collection.insert_one(data)

    @staticmethod
    def get_by_patient(patient_id):
        return list(MedicalCondition.collection.find({"patient_id": patient_id}))

    @staticmethod
    def delete_by_id(condition_id):
        return MedicalCondition.collection.delete_one({"_id": ObjectId(condition_id)})
