from flask import Blueprint, request
from flask_restful import Resource, Api
from app.database.queries import create_review, get_all_reviews, update_review, delete_review
from app.utils.schemas import ReviewSchema
from app.utils.auth import login_required

reviews_bp = Blueprint("reviews", __name__, url_prefix="/api/reviews")
reviews_api = Api(reviews_bp)
review_schema = ReviewSchema()


class ReviewListResource(Resource):
    def get(self):
        reviews = get_all_reviews()
        return {"reviews": [review_schema.dump(r) for r in reviews]}

    @login_required
    def post(self):
        data = request.get_json(silent=True) or {}
        user_id = request.user_id
        movie_title = data.get("movieTitle") or data.get("movie_title")
        rating = data.get("rating")
        text = data.get("text")
        poster_url = data.get("posterUrl") or data.get("poster_url", "")

        if not movie_title or not rating or not text:
            return {"error": "movie_title, rating, and text are required"}, 400

        review_id = create_review(
            user_id,
            movie_title,
            int(rating),
            text,
            poster_url,
        )
        return {
            "review": {
                "id": review_id,
                "user_id": user_id,
                "movie_title": movie_title,
                "rating": rating,
                "text": text,
                "poster_url": poster_url,
            }
        }, 201



class ReviewResource(Resource):
    def patch(self, review_id):
        data = request.get_json(silent=True) or {}
        update_review(review_id, **data)
        return {"review": {"id": review_id, **data}}

    def delete(self, review_id):
        delete_review(review_id)
        return {"deleted": True}


reviews_api.add_resource(ReviewListResource, "")
reviews_api.add_resource(ReviewResource, "/<int:review_id>")