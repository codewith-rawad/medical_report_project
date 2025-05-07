from app import mongo
from datetime import datetime

class User:
    def __init__(self, name, email, password, role="user", phone=None, address=None, age=None, profile_pic=None):
        self.name = name
        self.email = email
        self.password = password
        self.role = role
        self.phone = phone
        self.address = address
        self.age = age
        self.profile_pic = profile_pic
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def save(self):
        user_collection = mongo.db.users
        user_collection.insert_one(self.__dict__)

    def update(self, updates):
        self.updated_at = datetime.utcnow()
        mongo.db.users.update_one({"email": self.email}, {"$set": {**updates, "updated_at": self.updated_at}})

    def delete(self):
        mongo.db.users.delete_one({"email": self.email})

    @staticmethod
    def find_by_email(email):
        return mongo.db.users.find_one({"email": email})

    @staticmethod
    def find_by_id(user_id):
        return mongo.db.users.find_one({"_id": user_id})

    @staticmethod
    def get_all():
        return list(mongo.db.users.find())
