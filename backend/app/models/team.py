from app.extensions import db


class Team(db.Model):
    __tablename__ = "teams"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    code = db.Column(db.String(10))
    league = db.Column(db.String(120))
    stadium = db.Column(db.String(120))
    rating_score = db.Column(db.Float, default=0.0)

    home_fixtures = db.relationship("Fixture", foreign_keys="Fixture.team_home_id", backref="home_team", lazy=True)
    away_fixtures = db.relationship("Fixture", foreign_keys="Fixture.team_away_id", backref="away_team", lazy=True)