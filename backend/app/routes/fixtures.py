from flask import Blueprint, request
from flask_restful import Resource, Api
from app.database.queries import get_all_fixtures, get_fixture, create_fixture, update_fixture_status
from app.utils.auth import admin_required, login_required
from app.utils.schemas import FixtureSchema

fixtures_bp = Blueprint("fixtures", __name__, url_prefix="/api/fixtures")
fixtures_api = Api(fixtures_bp)
fixture_schema = FixtureSchema()


class FixtureListResource(Resource):
    def get(self):
        rows = get_all_fixtures()
        return {"fixtures": [fixture_schema.dump(row) for row in rows]}

    @admin_required
    def post(self):
        data = request.get_json(silent=True) or {}
        errors = fixture_schema.validate(data)
        if errors:
            return {"errors": errors}, 400

        fixture_id = create_fixture(
            data["team_home_id"],
            data["team_away_id"],
            data["match_date"],
            data.get("status", "SCHEDULED"),
        )
        row = get_fixture(fixture_id)
        return {"fixture": fixture_schema.dump(row)}, 201


class FixtureResource(Resource):
    def get(self, fixture_id):
        row = get_fixture(fixture_id)
        if not row:
            return {"error": "Fixture not found"}, 404
        return {"fixture": fixture_schema.dump(row)}


class FixtureStatusResource(Resource):
    @admin_required
    def patch(self, fixture_id):
        data = request.get_json(silent=True) or {}
        status = data.get("status")
        if not status:
            return {"error": "status is required"}, 400
        update_fixture_status(fixture_id, status)
        row = get_fixture(fixture_id)
        return {"fixture": fixture_schema.dump(row)}


fixtures_api.add_resource(FixtureListResource, "")
fixtures_api.add_resource(FixtureResource, "/<int:fixture_id>")
fixtures_api.add_resource(FixtureStatusResource, "/<int:fixture_id>/status")