from flask import Blueprint, request, jsonify
import os
import base64
from werkzeug.utils import secure_filename
from bson import ObjectId
from app import mongo
from app.ml_models.extractor import run_selected_models

ml_models_bp = Blueprint('ml_models', __name__)  

@ml_models_bp.route('/extract_keywords', methods=['POST'])
def extract_keywords():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = request.files['image']
    selected_models = request.form.getlist('models')
    user_id = request.form.get('user_id')

    if not selected_models:
        return jsonify({'error': 'No models selected'}), 400
    if not user_id:
        return jsonify({'error': 'Missing user ID'}), 400

   
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filename = secure_filename(image.filename)
    image_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(image_path, "wb") as f:
        f.write(image.read())

    try:
       
        keywords = run_selected_models(image_path, selected_models)

      
        with open(image_path, "rb") as img_file:
            image_base64 = base64.b64encode(img_file.read()).decode("utf-8")

        result = mongo.db.images.insert_one({
            "user_id": ObjectId(user_id),
            "filename": filename,
            "image_base64": image_base64,
            "keywords": keywords
        })
        image_id = str(result.inserted_id)

       
        os.remove(image_path)

        return jsonify({
            "keywords": keywords,
            "image_base64": image_base64,
            "image_id": image_id  
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
