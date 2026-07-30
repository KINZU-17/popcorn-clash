from app.extensions import db


class Prediction(db.Model):
    __tablename__ = "vote_predictions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    fixture_id = db.Column(db.Integer, db.ForeignKey("fixtures.id"), nullable=False)
    predicted_winner_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=True)
    confidence_score = db.Column(db.Integer, default=50)
    created_at = db.Column(db.String(255), default="CURRENT_TIMESTAMP")