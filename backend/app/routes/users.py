from flask import Blueprint, request
from flask_restful import Resource, Api
from app.database.queries import (
    get_user_by_id,
    update_user_profile,
    get_user_predictions,
    update_user_role,
    delete_user,
    get_stats,
    search_users,
)
from app.utils.auth import login_required, admin_required
from app.utils.schemas import ProfileUpdateSchema

from flask_restful import reqparse
users_bp = Blueprint("users", __name__, url_prefix="/api/users")
users_api = Api(users_bp)
profile_update_schema = ProfileUpdateSchema()


from app.utils.auth import login_required, admin_required, _current_user_id

class UserSearchResource(Resource):
    def get(self):
        q = request.args.get("q", "").strip()
        user_id = _current_user_id()
        users = search_users(q, user_id)
        return {"users": users}



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
        parser = reqparse.RequestParser()
        parser.add_argument("page", type=int, default=1, location="args")
        parser.add_argument("per_page", type=int, default=10, location="args")
        args = parser.parse_args()
        page = args["page"]
        per_page = args["per_page"]
        offset = (page - 1) * per_page

        from app.database.connection import get_cursor

        with get_cursor() as cur:
            cur.execute("SELECT COUNT(*) as count FROM users")
            total = cur.fetchone()['count']

            cur.execute("""
                SELECT id, username, email, favorite_club, current_level, total_xp, prediction_streak, role, is_banned
                FROM users
                ORDER BY id ASC
                LIMIT ? OFFSET ?
            """, (per_page, offset))
            users = [dict(row) for row in cur.fetchall()]

        return {
            "users": users,
            "pagination": {"total": total, "page": page, "per_page": per_page, "pages": (total + per_page - 1) // per_page}
        }


class UserRoleResource(Resource):
    @admin_required
    def patch(self, user_id):
        data = request.get_json(silent=True) or {}
        role = data.get("role")
        if role not in ("member", "admin"):
            return {"error": "Role must be 'member' or 'admin'"}, 400
        # Prevent demoting yourself
        if user_id == request.user_id and role != "admin":
            return {"error": "Cannot change your own admin role"}, 400
        update_user_role(user_id, role)
        user = get_user_by_id(user_id)
        if not user:
            return {"error": "User not found"}, 404
        return {"user": {"id": user["id"], "username": user["username"], "role": user["role"]}}


class UserDeleteResource(Resource):
    @admin_required
    def delete(self, user_id):
        if user_id == request.user_id:
            return {"error": "Cannot delete your own account"}, 400
        user = get_user_by_id(user_id)
        if not user:
            return {"error": "User not found"}, 404
        delete_user(user_id)
        return {"deleted": True}


class StatsResource(Resource):
    @admin_required
    def get(self):
        stats = get_stats()
        return {"stats": stats}


users_api.add_resource(ProfileResource, "/profile")
users_api.add_resource(UserSearchResource, "/search")
users_api.add_resource(UserListResource, "/")
users_api.add_resource(UserRoleResource, "/<int:user_id>/role")
users_api.add_resource(UserDeleteResource, "/<int:user_id>")
users_api.add_resource(StatsResource, "/stats")