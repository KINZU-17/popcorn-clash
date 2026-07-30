from flask import Blueprint, request
from flask_restful import Resource, Api
from app.database.queries import create_prediction, get_predictions_for_fixture
from app.utils.auth import login_required
from app.utils.schemas import PredictionSchema

predictions_bp = Blueprint("predictions", __name__, url_prefix="/api/predictions")
predictions_api = Api(predictions_bp)
prediction_schema = PredictionSchema()


class PredictionCreateResource(Resource):
    @login_required
    def post(self):
        data = request.get_json(silent=True) or {}
        errors = prediction_schema.validate(data)
        if errors:
            return {"errors": errors}, 400

        prediction_id = create_prediction(
            request.user_id,
            data["fixture_id"],
            data.get("predicted_winner_id"),
            data["confidence"],
        )
        return {"prediction_id": prediction_id, "confidence": data["confidence"]}, 201


class PredictionListResource(Resource):
    def get(self, fixture_id):
        rows = get_predictions_for_fixture(fixture_id)
        return {"predictions": rows}


predictions_api.add_resource(PredictionCreateResource, "")
predictions_api.add_resource(PredictionListResource, "/fixture/<int:fixture_id>")