from flask import Blueprint, request, jsonify
import os
import base64
from werkzeug.utils import secure_filename
from bson import ObjectId
from app import mongo
from app.ml_models.extractor import run_selected_models

ml_models_bp = Blueprint('ml_models', __name__)  

@ml_models_bp.route('/api/ml_models/extract_keywords', methods=['POST'])
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

    image_bytes = image.read()
    image_base64 = base64.b64encode(image_bytes).decode('utf-8')

    temp_path = f"/tmp/{secure_filename(image.filename)}"
    with open(temp_path, "wb") as f:
        f.write(image_bytes)

    try:
        keywords = run_selected_models(temp_path, selected_models)

        os.remove(temp_path)

        return jsonify({
            'keywords': keywords,
            'image_base64': image_base64,
            'user_id': user_id
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
