from app import mongo

class User:
    def __init__(self, name, email, password, role="user"): 
        self.name = name
        self.email = email
        self.password = password
        self.role = role  
    def save(self):
        user_collection = mongo.db.users
        user_collection.insert_one(self.__dict__)

    @staticmethod
    def find_by_email(email):
        user_collection = mongo.db.users
        return user_collection.find_one({"email": email})
