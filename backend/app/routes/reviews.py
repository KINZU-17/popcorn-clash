from flask import Blueprint, request
from flask_restful import Resource, Api
from app.database.queries import create_review, get_all_reviews, update_review, delete_review
from app.utils.schemas import ReviewSchema

reviews_bp = Blueprint("reviews", __name__, url_prefix="/api/reviews")
reviews_api = Api(reviews_bp)
review_schema = ReviewSchema()


class ReviewListResource(Resource):
    def get(self):
        reviews = get_all_reviews()
        return {"reviews": [review_schema.dump(r) for r in reviews]}

    def post(self):
        data = request.get_json(silent=True) or {}
        errors = review_schema.validate(data)
        if errors:
            return {"errors": errors}, 400

        review_id = create_review(
            data["user_id"],
            data["movie_title"],
            data["rating"],
            data["text"],
            data.get("poster_url", ""),
        )
        return {
            "review": {
                "id": review_id,
                "user_id": data["user_id"],
                "movie_title": data["movie_title"],
                "rating": data["rating"],
                "text": data["text"],
                "poster_url": data.get("poster_url", ""),
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