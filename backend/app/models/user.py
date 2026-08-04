from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    favorite_club = db.Column(db.String(120))
    current_level = db.Column(db.Integer, default=1)
    total_xp = db.Column(db.Integer, default=0)
    prediction_streak = db.Column(db.Integer, default=0)
    role = db.Column(db.String(20), default="member")
    is_banned = db.Column(db.Integer, default=0)

    predictions = db.relationship("Prediction", backref="user", lazy=True)
    reviews = db.relationship("Review", backref="user", lazy=True)