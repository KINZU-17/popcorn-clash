from app.extensions import db


class WatchHistory(db.Model):
    __tablename__ = "watch_history"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey("movies.id"), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    poster_url = db.Column(db.String(512), nullable=True)
    progress = db.Column(db.Integer, default=100)
    watched_at = db.Column(db.String(255), default="CURRENT_TIMESTAMP")
