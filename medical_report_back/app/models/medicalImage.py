from app import mongo
from datetime import datetime

class MedicalImage:
    def __init__(self, user_id, image_url, notes=None):
        self.user_id = user_id
        self.image_url = image_url
        self.notes = notes
        self.upload_date = datetime.utcnow()

    def save(self):
        mongo.db.images.insert_one(self.__dict__)

    @staticmethod
    def get_by_user(user_id):
        return list(mongo.db.images.find({"user_id": user_id}))

    @staticmethod
    def get_by_id(image_id):
        return mongo.db.images.find_one({"_id": image_id})

    @staticmethod
    def delete_by_id(image_id):
        mongo.db.images.delete_one({"_id": image_id})
