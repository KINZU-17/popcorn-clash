import os
import random
from datetime import datetime, timedelta, timezone

from flask import Blueprint, request, jsonify
from flask_restful import Resource, Api, reqparse
import jwt as pyjwt
from app.database.queries import (
    get_user_by_email,
    get_user_by_username,
    create_user,
    get_user_by_id,
    update_user_profile,
    create_password_reset,
    verify_and_use_reset_code,
    update_user_password,
)
from app.utils.auth import create_token, bcrypt
from app.utils.schemas import UserSchema
from app.utils.decorators import rate_limit
import time
from app.utils.mailer import send_reset_email

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth/")
api = Api(auth_bp)
user_schema = UserSchema() 


def generate_reset_token(user_id: int, expires_in_minutes: int = 15) -> str:
    """Generates a signed, time-expiring token containing the user's ID."""
    expiration = datetime.now(timezone.utc) + timedelta(minutes=expires_in_minutes)
    payload = {
        "user_id": user_id,
        "exp": expiration
    }
    return pyjwt.encode(payload, os.environ.get("SECRET_KEY", "dev-secret"), algorithm="HS256")


def verify_reset_token(token: str) -> int | None:
    """Decodes the token and returns the user_id if valid and non-expired."""
    try:
        payload = pyjwt.decode(token, os.environ.get("SECRET_KEY", "dev-secret"), algorithms=["HS256"])
        return payload.get("user_id")
    except (pyjwt.ExpiredSignatureError, pyjwt.InvalidTokenError):
        return None


def _hash_password(password: str) -> str:
    return bcrypt.generate_password_hash(password).decode("utf-8")


def _check_password(password: str, hashed: str) -> bool:
    return bcrypt.check_password_hash(hashed, password)


class GoogleAuthResource(Resource):
    def post(self):
        data = request.get_json(silent=True) or {}
        credential = data.get("credential") or ""

        if not credential:
            return {"error": "Google credential is required"}, 400

        try:
            payload = pyjwt.decode(credential, options={"verify_signature": False})
        except pyjwt.DecodeError:
            return {"error": "Invalid Google credential"}, 401

        google_id = payload.get("sub", "")
        email = (payload.get("email") or "").strip().lower()
        name = payload.get("name") or payload.get("given_name") or google_id
        username = name.replace(" ", "_").lower()[:30] or f"user_{google_id[:8]}"

        if not email:
            return {"error": "Email not found in Google profile"}, 400

        existing = get_user_by_email(email)
        if existing:
            token = create_token(existing["id"])
            return {
                "user": {
                    "id": existing["id"],
                    "username": existing["username"],
                    "email": existing["email"],
                    "favorite_club": existing["favorite_club"],
                    "current_level": existing["current_level"],
                    "total_xp": existing["total_xp"],
                    "prediction_streak": existing["prediction_streak"],
                    "role": existing["role"],
                },
                "token": token,
            }

        password_hash = _hash_password(google_id)
        user_id = create_user(username, email, password_hash, "")
        user = get_user_by_id(user_id)
        token = create_token(user["id"])
        return {
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
        }, 201


class RegisterResource(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("username", type=str, required=True, help="username is required")
        parser.add_argument("email", type=str, required=True, help="email is required")
        parser.add_argument("password", type=str, required=True, help="password is required")
        parser.add_argument("favorite_club", type=str, default="")
        args = parser.parse_args()

        errors = user_schema.validate(args)
        if errors:
            err_msg = "; ".join(f"{k}: {', '.join(v)}" for k, v in errors.items())
            return {"error": err_msg}, 400


        if get_user_by_email(args["email"]):
            return {"error": "Email already registered"}, 409

        password_hash = _hash_password(args["password"])
        user_id = create_user(args["username"], args["email"], password_hash, args["favorite_club"])
        user = get_user_by_id(user_id)
        token = create_token(user_id)
        return {
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
        }, 201


class LoginResource(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("username", type=str, required=True, help="username is required")
        parser.add_argument("password", type=str, required=True, help="password is required")
        args = parser.parse_args()

        user = get_user_by_username(args["username"])
        if not user or not _check_password(args["password"], user["password_hash"]):
            return {"error": "Invalid username or password"}, 401

        if user.get("is_banned"):
            return {"error": "This account has been suspended."}, 403

        token = create_token(user["id"])
        return {
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
        }


class ForgotPasswordResource(Resource):
    @rate_limit(limit=5, per=300)  # 5 requests per 5 minutes
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("email", type=str, required=True, help="email is required")
        args = parser.parse_args()

        email = args["email"].strip().lower()
        user = get_user_by_email(email)

        # Security best practice: Always return 200 message to prevent user enumeration
        if user:
            reset_token = generate_reset_token(user["id"])
            code = f"{random.randint(100000, 999999)}"
            expires_at = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()

            create_password_reset(email, code, expires_at)
            email_sent = send_reset_email(user["email"], reset_token, reset_code=code)

            # If in dev fallback mode, pass details to the client for easier testing
            if not email_sent:
                return {"message": "Dev Fallback: Email not sent.", "dev_fallback": True, "reset_token": reset_token, "reset_code": code}, 200

        return {"message": "If an account with that email exists, a reset link and verification code have been sent."}, 200


class ResetPasswordResource(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("email", type=str, required=False)
        parser.add_argument("code", type=str, required=False)
        parser.add_argument("token", type=str, required=False)
        parser.add_argument("new_password", type=str, required=False)
        parser.add_argument("password", type=str, required=False)
        args = parser.parse_args()

        new_pass = args.get("new_password") or args.get("password")
        token = args.get("token")
        code = args.get("code")
        email = (args.get("email") or "").strip().lower()

        if not new_pass:
            return {"error": "Missing new password"}, 400

        if len(new_pass) < 6:
            return {"error": "Password must be at least 6 characters long"}, 400

        user_id = None
        target_email = email

        # 1. Try JWT token verification
        if token:
            user_id = verify_reset_token(token)
            if user_id:
                user = get_user_by_id(user_id)
                if user:
                    target_email = user["email"]

        # 2. Try OTP code verification if JWT token was not passed or invalid
        if not user_id and email and code:
            if verify_and_use_reset_code(email, code):
                user = get_user_by_email(email)
                if user:
                    user_id = user["id"]
                    target_email = user["email"]

        if not user_id or not target_email:
            return {"error": "Invalid or expired reset token or verification code"}, 400

        new_hash = _hash_password(new_pass)
        update_user_password(target_email, new_hash)

        return {"message": "Password updated successfully! You can now log in with your new password."}, 200


api.add_resource(RegisterResource, "/register")
api.add_resource(LoginResource, "/login")
api.add_resource(ForgotPasswordResource, "/forgot-password")
api.add_resource(ResetPasswordResource, "/reset-password")