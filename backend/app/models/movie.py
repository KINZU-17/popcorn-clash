from app.extensions import db


class Movie(db.Model):
    __tablename__ = "movies"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tmdb_id = db.Column(db.Integer, unique=True, nullable=True)
    title = db.Column(db.String(255), nullable=False)
    overview = db.Column(db.Text, nullable=True)
    poster_url = db.Column(db.String(512), nullable=True)
    genre = db.Column(db.String(120), nullable=True)
    year = db.Column(db.Integer, nullable=True)
    rating = db.Column(db.Float, nullable=True)
    duration = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.String(255), default="CURRENT_TIMESTAMP")