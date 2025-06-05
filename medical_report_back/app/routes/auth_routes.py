from flask import Blueprint, request, jsonify
from app.models.user_model import User
from flask_bcrypt import Bcrypt
import jwt
import datetime

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

SECRET_KEY = 'your_secret_key'


@auth_bp.route('/signup', methods=['POST'])
def register():
    data = request.get_json()

    if not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({"message": "Email, name, and password are required"}), 400

    role = 'doctor'  

    if User.find_by_email(data['email']):
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password,
        role=role,
    )
    new_user.save()

    return jsonify({"message": "Doctor account created successfully"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data.get('email') or not data.get('password'):
        return jsonify({"message": "Email and password are required"}), 400

    user = User.find_by_email(data['email'])
    if not user:
        return jsonify({"message": "User not found"}), 404

    if not bcrypt.check_password_hash(user['password'], data['password']):
        return jsonify({"message": "Invalid credentials"}), 401

    token = jwt.encode({
        'user_id': str(user['_id']),
        'role': user['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }, SECRET_KEY, algorithm='HS256')

    user_data = {
        "_id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", ""),
        "phone": user.get("phone", ""),
        "address": user.get("address", ""),
        "age": user.get("age", ""),
        "profile_pic": user.get("profile_pic", "")
    }

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user_data
    }), 200
