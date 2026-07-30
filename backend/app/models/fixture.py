from app.extensions import db


class Fixture(db.Model):
    __tablename__ = "fixtures"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    team_home_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=False)
    team_away_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=False)
    match_date = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default="SCHEDULED")

    predictions = db.relationship("Prediction", backref="fixture", lazy=True)