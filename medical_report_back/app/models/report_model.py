from app import mongo

class Report:
    def __init__(self, user_id, image_url, report_text):
        self.user_id = user_id
        self.image_url = image_url
        self.report_text = report_text

    def save(self):
        report_collection = mongo.db.reports
        report_collection.insert_one(self.__dict__)
