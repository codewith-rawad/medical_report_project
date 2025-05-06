from flask import Blueprint, request, jsonify
from app.models.user_model import User
from flask_bcrypt import Bcrypt

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/signup', methods=['POST'])
def register():
    data = request.get_json()

  
    if not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({"message": "Email, name, and password are required"}), 400

    
    role = data.get('role', 'user')  

 
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password,
        role=role  
    )

    new_user.save()

    return jsonify({"message": "User created successfully"}), 201
