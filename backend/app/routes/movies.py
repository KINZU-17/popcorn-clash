from flask import Blueprint, request, jsonify
from flask_restful import Resource, Api, reqparse
from app.database.queries import (
    get_all_movies,
    get_movie_by_id,
    create_movie,
    delete_movie as db_delete_movie,
    update_user_movie_status,
)
from app.utils.auth import token_required

movies_bp = Blueprint("movies", __name__, url_prefix="/api/movies/")
api = Api(movies_bp)


class MovieListResource(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument("limit", type=int, default=50)
        args = parser.parse_args()
        movies = get_all_movies(limit=args["limit"])
        return jsonify(movies=movies)

    @token_required
    def post(self, current_user):
        parser = reqparse.RequestParser()
        parser.add_argument("tmdb_id", type=int)
        parser.add_argument("title", type=str, required=True)
        parser.add_argument("overview", type=str, default="")
        parser.add_argument("poster_url", type=str, default="")
        parser.add_argument("genre", type=str, default="")
        parser.add_argument("year", type=int)
        parser.add_argument("rating", type=float)
        parser.add_argument("duration", type=str, default="")
        args = parser.parse_args()

        movie_id = create_movie(**args)
        movie = get_movie_by_id(movie_id)
        return movie, 201


class MovieResource(Resource):
    @token_required
    def delete(self, current_user, movie_id: int):
        # Add role check if necessary, e.g. if current_user['role'] == 'admin':
        db_delete_movie(movie_id)
        return {"message": "Movie deleted successfully"}, 200


api.add_resource(MovieListResource, "/")
api.add_resource(MovieResource, "/<int:movie_id>")