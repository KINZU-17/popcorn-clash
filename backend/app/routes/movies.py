from flask import Blueprint, request, jsonify
from flask_restful import Resource, Api, reqparse
from app.database.queries import (
    get_all_movies,
    get_movie_by_id,
    create_movie,
    delete_movie as db_delete_movie,
    update_user_movie_status,
    get_user_movie_statuses,
)
from app.utils.auth import login_required

movies_bp = Blueprint("movies", __name__, url_prefix="/api/movies")
api = Api(movies_bp)


class MovieListResource(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument("limit", type=int, default=50)
        parser.add_argument("q", type=str, default="")
        args = parser.parse_args()
        result = get_all_movies(limit=args["limit"], query=args["q"])
        movies = result["movies"] if isinstance(result, dict) else result
        return jsonify(movies=movies)

    @login_required
    def post(self):
        data = request.get_json(silent=True) or {}
        movie_id = create_movie(
            tmdb_id=data.get("tmdb_id"),
            title=data.get("title", ""),
            overview=data.get("overview", ""),
            poster_url=data.get("poster_url", ""),
            genre=data.get("genre", ""),
            year=data.get("year"),
            rating=data.get("rating"),
            duration=data.get("duration", ""),
        )
        movie = get_movie_by_id(movie_id)
        return movie, 201


class MovieResource(Resource):
    @login_required
    def delete(self, movie_id: int):
        db_delete_movie(movie_id)
        return {"message": "Movie deleted successfully"}, 200


class MovieStatusResource(Resource):
    @login_required
    def get(self):
        statuses = get_user_movie_statuses(request.user_id)
        return {"status": statuses}

    @login_required
    def patch(self, movie_id: int):
        data = request.get_json(silent=True) or {}
        update_user_movie_status(
            request.user_id, movie_id,
            status=data.get("status"),
            is_favorite=data.get("is_favorite"),
        )
        return {"message": "Movie status updated"}, 200


api.add_resource(MovieListResource, "/")
api.add_resource(MovieResource, "/<int:movie_id>")
api.add_resource(MovieStatusResource, "/status", "/<int:movie_id>/status")
