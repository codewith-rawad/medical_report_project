from app import mongo

class Image:
    def __init__(self, user_id, image_url):
        self.user_id = user_id
        self.image_url = image_url

    def save(self):
        image_collection = mongo.db.images
        image_collection.insert_one(self.__dict__)
