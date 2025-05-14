from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from app.models.extractor import run_selected_models

models_bp = Blueprint('models', __name__)
UPLOAD_FOLDER = 'uploads'

# تأكد من وجود مجلد الصور
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@models_bp.route('/api/models/extract_keywords', methods=['POST'])
def extract_keywords():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = request.files['image']
    selected_models = request.form.getlist('models') 

    if not selected_models:
        return jsonify({'error': 'No models selected'}), 400

    filename = secure_filename(image.filename)
    image_path = os.path.join(UPLOAD_FOLDER, filename)
    image.save(image_path)

    try:
        keywords = run_selected_models(image_path, selected_models)
        return jsonify({
            'keywords': keywords,
            'image_path': image_path
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
