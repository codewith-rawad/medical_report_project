from flask import Blueprint, request, jsonify
from app.models.user_model import User
from flask_bcrypt import Bcrypt

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()


@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
   
    if not data.get('email') or not data.get('password'):
        return jsonify({"message": "Email and password are required"}), 400

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password
    )
    

    new_user.save()
    return jsonify({"message": "User created successfully"}), 201
