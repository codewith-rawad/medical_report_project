from flask import Flask
from flask_pymongo import PyMongo
from dotenv import load_dotenv
from flask_cors import CORS
from .extensions import bcrypt
import os

load_dotenv()  

mongo = PyMongo()

def create_app():
    app = Flask(__name__)
    CORS(app) 
  
    app.config["MONGO_URI"] = os.getenv("MONGO_URI")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    mongo.init_app(app)
    bcrypt.init_app(app)  
  
    from app.routes.auth_routes import auth_bp
    from app.routes.report_routes import report_bp
    from app.routes.image_routes import image_bp

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(report_bp, url_prefix="/api")
    app.register_blueprint(image_bp, url_prefix="/api")

    return app
