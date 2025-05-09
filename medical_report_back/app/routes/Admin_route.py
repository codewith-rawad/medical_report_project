
from flask import Blueprint, request, jsonify
from app.models.user_model import User
from bson import ObjectId

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
def get_users():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 3))
        skip = (page - 1) * per_page

        users_cursor = User.collection.find().skip(skip).limit(per_page)
        total_users = User.collection.count_documents({})

        users = []
        for user in users_cursor:
            user['_id'] = str(user['_id'])
            users.append(user)

        return jsonify({
            "users": users,
            "total": total_users,
            "page": page,
            "per_page": per_page
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route('/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        result = User.collection.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            return jsonify({"message": "User not found"}), 404

        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
