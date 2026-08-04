from app.extensions import db


class UserMovieStatus(db.Model):
    __tablename__ = "user_movie_statuses"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey("movies.id"), nullable=False)
    status = db.Column(db.String(50), default="watchlist")
    is_favorite = db.Column(db.Integer, default=0)
    created_at = db.Column(db.String(255), default="CURRENT_TIMESTAMP")
