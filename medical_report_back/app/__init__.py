from flask import Flask
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os

load_dotenv()  

mongo = PyMongo()

def create_app():
    app = Flask(__name__)

  
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    mongo.init_app(app)

  
    from app.routes.auth_routes import auth_bp
    from app.routes.report_routes import report_bp
    from app.routes.image_routes import image_bp

 
    app.register_blueprint(auth_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(image_bp)

    return app
