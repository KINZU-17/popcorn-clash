from flask import Blueprint, request, jsonify
from flask_restful import Resource, Api, reqparse
import jwt as pyjwt
from app.database.queries import get_user_by_email, get_user_by_username, create_user, get_user_by_id, update_user_profile
from app.database.connection import get_cursor
from app.utils.auth import create_token, bcrypt
from app.utils.schemas import UserSchema

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
api = Api(auth_bp)

user_schema = UserSchema()


def _hash_password(password: str) -> str:
    return bcrypt.generate_password_hash(password).decode("utf-8")


def _check_password(password: str, hashed: str) -> bool:
    return bcrypt.check_password_hash(hashed, password)


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


api.add_resource(GoogleAuthResource, "/google")
api.add_resource(RegisterResource, "/register")
api.add_resource(LoginResource, "/login")