from app import mongo
from datetime import datetime
from bson import ObjectId

class MedicalCondition:
    collection = mongo.db.conditions

    def __init__(self, patient_id, image_url, report_url, story):
        self.patient_id = patient_id
        self.image_url = image_url
        self.report_url = report_url
        self.story = story
        self.created_at = datetime.utcnow()

    def save(self):
        MedicalCondition.collection.insert_one(self.__dict__)

    @staticmethod
    def get_by_patient(patient_id):
        return list(MedicalCondition.collection.find({"patient_id": patient_id}))

    @staticmethod
    def delete_by_id(condition_id):
        return MedicalCondition.collection.delete_one({"_id": ObjectId(condition_id)})
