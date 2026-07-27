import hashlib
from datetime import datetime
from flask import Blueprint, request, jsonify
from app.database.queries import get_user_by_email, get_user_by_username, create_user, get_user_by_id, update_user_profile
from app.database.connection import get_cursor
from app.utils.auth import create_token

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    favorite_club = (data.get("favorite_club") or "").strip()

    if not username or not email or not password:
        return jsonify({"error": "username, email, and password are required"}), 400

    if get_user_by_email(email):
        return jsonify({"error": "Email already registered"}), 409

    password_hash = _hash_password(password)
    user_id = create_user(username, email, password_hash, favorite_club)
    user = get_user_by_id(user_id)
    token = create_token(user_id)
    return jsonify({
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "favorite_club": user["favorite_club"],
            "current_level": user["current_level"],
            "total_xp": user["total_xp"],
            "prediction_streak": user["prediction_streak"],
            "role": user["role"],
        },
        "token": token,
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400

    user = get_user_by_username(username)
    if not user or user["password_hash"] != _hash_password(password):
        return jsonify({"error": "Invalid username or password"}), 401

    token = create_token(user["id"])
    return jsonify({
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "favorite_club": user["favorite_club"],
            "current_level": user["current_level"],
            "total_xp": user["total_xp"],
            "prediction_streak": user["prediction_streak"],
            "role": user["role"],
        },
        "token": token,
    })
