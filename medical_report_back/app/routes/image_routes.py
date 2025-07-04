from flask import Blueprint, request, jsonify
from app.models.medicalImage import MedicalImage

image_bp = Blueprint('image', __name__)


@image_bp.route('/api/upload_image', methods=['POST'])
def upload_image():
    data = request.get_json()
    new_image = MedicalImage(
        user_id=data['user_id'],
        image_url=data['image_url']
    )

    new_image.save()
    return jsonify({"message": "Image uploaded successfully"}), 201
