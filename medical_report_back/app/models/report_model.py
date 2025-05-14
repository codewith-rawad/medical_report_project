from app import mongo
from datetime import datetime
from bson import ObjectId  

class Report:
    def __init__(self, user_id, image_id, text, status="completed"):
        self.user_id = user_id
        self.image_id = image_id
        self.text = text
        self.status = status
        self.date = datetime.utcnow()

    def save(self):

        existing_report = mongo.db.reports.find_one({"user_id": self.user_id, "image_id": self.image_id})
        if existing_report:
            return {"error": "Report already exists for this user and image"}
        
       
        mongo.db.reports.insert_one(self.__dict__)
        return {"message": "Report created successfully"}

    @staticmethod
    def get_by_user(user_id):
        return list(mongo.db.reports.find({"user_id": user_id}))

    @staticmethod
    def get_by_image(image_id):
        return list(mongo.db.reports.find({"image_id": image_id}))

    @staticmethod
    def delete_by_id(report_id):
        result = mongo.db.reports.delete_one({"_id": ObjectId(report_id)})
        if result.deleted_count > 0:
            return {"message": "Report deleted successfully"}
        else:
            return {"error": "Report not found"}
