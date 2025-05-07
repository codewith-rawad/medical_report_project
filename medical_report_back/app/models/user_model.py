from app import mongo
from datetime import datetime

class User:
    collection = mongo.db.users  

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
        return User.collection.find_one({"_id": user_id})

    @staticmethod
    def get_all():
        return list(User.collection.find())