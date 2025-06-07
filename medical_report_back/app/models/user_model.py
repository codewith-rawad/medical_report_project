# user.py
from app import mongo
from datetime import datetime
from bson import ObjectId

class User:
    collection = mongo.db.users

    def __init__(self, name, email, password, role=None, phone=None, address=None, profile_pic=None, age=None, specialty=None):
        self.name = name
        self.email = email
        self.password = password
        self.role = role  # doctor أو admin
        self.phone = phone
        self.address = address
        self.age = age
        self.specialty = specialty
        self.profile_pic = profile_pic
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def save(self):
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        User.collection.insert_one(self.__dict__)

    def delete(self):
        User.collection.delete_one({"email": self.email})

    @staticmethod
    def find_by_email(email):
        return User.collection.find_one({"email": email})

    @staticmethod
    def find_by_id(user_id):
        try:
            return User.collection.find_one({"_id": ObjectId(user_id)})
        except:
            return None

    @staticmethod
    def update_user(user_id, updates):
        updates["updated_at"] = datetime.utcnow()
        try:
            return User.collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": updates}
            )
        except:
            return None

    @staticmethod
    def get_all(): 
        return list(User.collection.find())
