from app.extensions import db


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    movie_title = db.Column(db.String(255), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    text = db.Column(db.Text, nullable=False)
    poster_url = db.Column(db.String(512), nullable=True)
    created_at = db.Column(db.String(255), default="CURRENT_TIMESTAMP")