from flask import Blueprint, request
from flask_restful import Resource, Api
from app.database.queries import get_user_by_id, update_user_profile, get_user_predictions
from app.utils.auth import login_required, admin_required
from app.utils.schemas import ProfileUpdateSchema

users_bp = Blueprint("users", __name__, url_prefix="/api/users")
users_api = Api(users_bp)
profile_update_schema = ProfileUpdateSchema()


class ProfileResource(Resource):
    @login_required
    def get(self):
        user_id = request.user_id
        user = get_user_by_id(user_id)
        if not user:
            return {"error": "User not found"}, 404

        predictions = get_user_predictions(user_id)
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
            "predictions": predictions,
        }

    @login_required
    def patch(self):
        user_id = request.user_id
        data = request.get_json(silent=True) or {}
        allowed_fields = {"username", "favorite_club"}
        updates = {k: v for k, v in data.items() if k in allowed_fields and v is not None}

        if not updates:
            return {"error": "No valid fields to update"}, 400

        errors = profile_update_schema.validate(updates)
        if errors:
            return {"errors": errors}, 400

        update_user_profile(user_id, **updates)
        user = get_user_by_id(user_id)
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
            }
        }


class UserListResource(Resource):
    @admin_required
    def get(self):
        from app.database.queries import get_all_teams
        from app.database.connection import get_cursor

        with get_cursor() as cur:
            cur.execute("""
                SELECT id, username, email, favorite_club, current_level, total_xp, prediction_streak, role
                FROM users
                ORDER BY id ASC
            """)
            users = [dict(row) for row in cur.fetchall()]
        return {"users": users}


users_api.add_resource(ProfileResource, "/profile")
users_api.add_resource(UserListResource, "/")