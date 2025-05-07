from flask import Blueprint, request, jsonify
from app.models.user_model import User 

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/update_profile', methods=['POST'])
def update_profile():
    data = request.get_json()
    id = data.get('_id')
    
    user = User.find_by_id(id)
    print(id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    updates = {}
    for field in ['phone', 'address', 'age', 'profile_pic']:
        if data.get(field):
            updates[field] = data[field]

  
    User.collection.update_one({"_id": user["_id"]}, {"$set": updates})

    return jsonify({"message": "Profile updated successfully"}), 200