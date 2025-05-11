from flask import Blueprint, request, jsonify
from app.models.user_model import User
from bson import ObjectId

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/update_profile', methods=['POST'])
def update_profile():
    data = request.get_json()
    user_id = data.get('_id')

    if not user_id:
        return jsonify({"message": "User ID is required"}), 400

    user = User.find_by_id(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    updates = {}
    for field in ['phone', 'address', 'age', 'profile_pic']:
        value = data.get(field)
        if value:
            updates[field] = value

    User.update_user(user['_id'], updates)
    return jsonify({"message": "Profile updated successfully"}), 200
