from app import mongo
from datetime import datetime

class Report:
    def __init__(self, user_id, image_id, text, status="completed"):
        self.user_id = user_id
        self.image_id = image_id
        self.text = text
        self.status = status
        self.date = datetime.utcnow()

    def save(self):
        mongo.db.reports.insert_one(self.__dict__)

    @staticmethod
    def get_by_user(user_id):
        return list(mongo.db.reports.find({"user_id": user_id}))

    @staticmethod
    def get_by_image(image_id):
        return list(mongo.db.reports.find({"image_id": image_id}))

    @staticmethod
    def delete_by_id(report_id):
        mongo.db.reports.delete_one({"_id": report_id})
