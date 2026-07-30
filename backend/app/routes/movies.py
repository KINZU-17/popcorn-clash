from flask import Blueprint, request
from flask_restful import Resource, Api
from app.database.queries import get_all_movies, get_movie_by_id, create_movie, delete_movie, get_user_movie_statuses, update_user_movie_status
from app.utils.schemas import MovieSchema
from app.utils.auth import login_required


movies_bp = Blueprint("movies", __name__, url_prefix="/api/movies")
movies_api = Api(movies_bp)
movie_schema = MovieSchema()


class MovieListResource(Resource):
    def get(self):
        query = request.args.get("q", "")
        genre = request.args.get("genre", "")
        limit = request.args.get("limit", 50, type=int)

        movies = get_all_movies(limit=limit)

        if query:
            q = query.lower()
            movies = [m for m in movies if q in (m.get("title") or "").lower() or q in (m.get("genre") or "").lower()]
        if genre:
            movies = [m for m in movies if (m.get("genre") or "").lower() == genre.lower()]

        return {"movies": [movie_schema.dump(m) for m in movies]}

    def post(self):
        data = request.get_json(silent=True) or {}
        errors = movie_schema.validate(data)
        if errors:
            return {"errors": errors}, 400

        movie_id = create_movie(
            data.get("tmdb_id"),
            data["title"],
            data.get("overview", ""),
            data.get("poster_url", ""),
            data.get("genre", ""),
            data.get("year"),
            data.get("rating"),
            data.get("duration", ""),
        )
        movie = get_movie_by_id(movie_id)
        return {"movie": movie_schema.dump(movie)}, 201


class MovieResource(Resource):
    def get(self, movie_id):
        movie = get_movie_by_id(movie_id)
        if not movie:
            return {"error": "Movie not found"}, 404
        return {"movie": movie_schema.dump(movie)}

    @login_required
    def delete(self, movie_id):
        movie = get_movie_by_id(movie_id)
        if not movie:
            return {"error": "Movie not found"}, 404
        delete_movie(movie_id)
        return {"deleted": True}


class MovieStatusListResource(Resource):
    @login_required
    def get(self):
        statuses = get_user_movie_statuses(request.user_id)
        return {"status": statuses}


class MovieStatusResource(Resource):
    @login_required
    def patch(self, movie_id):
        data = request.get_json(silent=True) or {}
        status = data.get("status")
        is_favorite = data.get("isFavorite") # Frontend sends isFavorite
        update_user_movie_status(request.user_id, movie_id, status=status, is_favorite=is_favorite)
        return {"status": "updated"}, 200


movies_api.add_resource(MovieListResource, "")
movies_api.add_resource(MovieResource, "/<int:movie_id>")
movies_api.add_resource(MovieStatusListResource, "/status")
movies_api.add_resource(MovieStatusResource, "/<int:movie_id>/status")