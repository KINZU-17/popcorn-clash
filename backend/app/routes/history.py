from flask import Blueprint, request
from flask_restful import Resource, Api
from app.database.queries import (
    create_watch_history_entry,
    get_user_watch_history,
    delete_watch_history_entry,
)
from app.utils.auth import login_required

history_bp = Blueprint("history", __name__, url_prefix="/api/history")
history_api = Api(history_bp)


class HistoryListResource(Resource):
    @login_required
    def get(self):
        user_id = request.user_id
        entries = get_user_watch_history(user_id)
        return {"history": entries}

    @login_required
    def post(self):
        user_id = request.user_id
        data = request.get_json(silent=True) or {}
        title = data.get("title")
        if not title:
            return {"error": "title is required"}, 400

        entry_id = create_watch_history_entry(
            user_id=user_id,
            movie_id=data.get("movie_id"),
            title=title,
            poster_url=data.get("poster_url", ""),
            progress=data.get("progress", 100),
        )
        return {
            "entry": {
                "id": entry_id,
                "user_id": user_id,
                "title": title,
                "poster_url": data.get("poster_url", ""),
                "progress": data.get("progress", 100),
                "watched_at": "Just now",
            }
        }, 201


class HistoryResource(Resource):
    @login_required
    def delete(self, entry_id):
        user_id = request.user_id
        delete_watch_history_entry(entry_id, user_id)
        return {"deleted": True}


history_api.add_resource(HistoryListResource, "")
history_api.add_resource(HistoryResource, "/<int:entry_id>")
