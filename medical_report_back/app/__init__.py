

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
    
    from app.routes.image_routes import image_bp
    from app.routes.profile_routes import profile_bp  
    from app.routes.Admin_route import admin_bp 
    from app.routes.models_route import ml_models_bp
    from app.routes.report_routes import generate_bp
    from app.routes.extractInfo_routes import nlp_bp
    # from app.routes.report_routes import test
 
    
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(image_bp, url_prefix="/api")
    app.register_blueprint(profile_bp, url_prefix="/api")  
    app.register_blueprint(admin_bp, url_prefix="/api")  
    app.register_blueprint(ml_models_bp, url_prefix="/api")
    app.register_blueprint(generate_bp, url_prefix="/api")
    app.register_blueprint(nlp_bp, url_prefix='/api/nlp')
    # app.register_blueprint(test, url_prefix="/api")


    return app
