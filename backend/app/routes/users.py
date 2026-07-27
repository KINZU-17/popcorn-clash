from flask import Blueprint, request, jsonify
from app.database.queries import get_user_by_id, update_user_profile, get_user_predictions
from app.utils.auth import login_required, admin_required

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.route("/profile", methods=["GET"])
@login_required
def get_profile():
    user_id = request.user_id
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    predictions = get_user_predictions(user_id)
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
        "predictions": predictions,
    })


@users_bp.route("/profile", methods=["PATCH"])
@login_required
def update_profile():
    user_id = request.user_id
    data = request.get_json(silent=True) or {}
    allowed_fields = {"username", "favorite_club"}
    updates = {k: v for k, v in data.items() if k in allowed_fields and v is not None}

    if not updates:
        return jsonify({"error": "No valid fields to update"}), 400

    update_user_profile(user_id, **updates)
    user = get_user_by_id(user_id)
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
        }
    })


@users_bp.route("/", methods=["GET"])
@admin_required
def list_all_users():
    from app.database.queries import get_all_teams
    from app.database.connection import get_cursor

    with get_cursor() as cur:
        cur.execute("""
            SELECT id, username, email, favorite_club, current_level, total_xp, prediction_streak, role
            FROM users
            ORDER BY id ASC
        """)
        users = [dict(row) for row in cur.fetchall()]
    return jsonify({"users": users})
