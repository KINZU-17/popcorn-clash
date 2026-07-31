from flask import Blueprint, jsonify
from flask_restful import Resource, Api
from app.database.queries import get_all_teams, get_leaderboard

teams_bp = Blueprint("teams", __name__, url_prefix="/api/teams/")
api = Api(teams_bp)


class TeamListResource(Resource):
    def get(self):
        teams = get_all_teams()
        return jsonify(teams=teams)


class LeaderboardResource(Resource):
    def get(self):
        leaderboard = get_leaderboard()
        return jsonify(leaderboard=leaderboard)


api.add_resource(TeamListResource, "/")
api.add_resource(LeaderboardResource, "/leaderboard")