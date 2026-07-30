from flask import Blueprint
from flask_restful import Resource, Api
from app.database.queries import get_all_teams, get_team_by_id, get_leaderboard
from app.utils.schemas import TeamSchema

teams_bp = Blueprint("teams", __name__, url_prefix="/api/teams")
teams_api = Api(teams_bp)
team_schema = TeamSchema()


class LeaderboardResource(Resource):
    def get(self):
        rows = get_leaderboard(limit=100)
        return {"leaderboard": rows}


class TeamListResource(Resource):
    def get(self):
        rows = get_all_teams()
        return {"teams": [team_schema.dump(row) for row in rows]}


class TeamResource(Resource):
    def get(self, team_id):
        row = get_team_by_id(team_id)
        if not row:
            return {"error": "Team not found"}, 404
        return {"team": team_schema.dump(row)}


teams_api.add_resource(LeaderboardResource, "/leaderboard")
teams_api.add_resource(TeamListResource, "")
teams_api.add_resource(TeamResource, "/<int:team_id>")