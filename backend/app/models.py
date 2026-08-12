from datetime import datetime
from .extensions import db


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    favorite_club = db.Column(db.String(120))
    current_level = db.Column(db.Integer, default=1)
    total_xp = db.Column(db.Integer, default=0)
    prediction_streak = db.Column(db.Integer, default=0)
    role = db.Column(db.String(20), default='member', nullable=False)
    is_banned = db.Column(db.Boolean, default=False, nullable=False)

    reviews = db.relationship('Review', backref='user', lazy=True, cascade="all, delete-orphan")
    predictions = db.relationship('VotePrediction', backref='user', lazy=True, cascade="all, delete-orphan")
    watch_history = db.relationship('WatchHistory', backref='user', lazy=True, cascade="all, delete-orphan")
    movie_statuses = db.relationship('UserMovieStatus', backref='user', lazy=True, cascade="all, delete-orphan")


class Team(db.Model):
    __tablename__ = 'teams'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    code = db.Column(db.String(10))
    league = db.Column(db.String(100))
    stadium = db.Column(db.String(100))
    rating_score = db.Column(db.Float, default=0.0)


class Fixture(db.Model):
    __tablename__ = 'fixtures'
    id = db.Column(db.Integer, primary_key=True)
    team_home_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    team_away_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    match_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='SCHEDULED') # SCHEDULED, LIVE, FINISHED, POSTPONED

    home_team = db.relationship('Team', foreign_keys=[team_home_id])
    away_team = db.relationship('Team', foreign_keys=[team_away_id])
    predictions = db.relationship('VotePrediction', backref='fixture', lazy=True, cascade="all, delete-orphan")


class VotePrediction(db.Model):
    __tablename__ = 'vote_predictions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    fixture_id = db.Column(db.Integer, db.ForeignKey('fixtures.id'), nullable=False)
    predicted_winner_id = db.Column(db.Integer, db.ForeignKey('teams.id'))
    confidence_score = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('user_id', 'fixture_id', name='_user_fixture_uc'),)


class Movie(db.Model):
    __tablename__ = 'movies'
    id = db.Column(db.Integer, primary_key=True)
    tmdb_id = db.Column(db.Integer, unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    overview = db.Column(db.Text)
    poster_url = db.Column(db.String(255))
    genre = db.Column(db.String(100))
    year = db.Column(db.Integer)
    rating = db.Column(db.Float)
    duration = db.Column(db.String(20)) # e.g. "2h 22m"

    reviews = db.relationship('Review', backref='movie', lazy=True) # Don't cascade delete reviews if movie is deleted
    statuses = db.relationship('UserMovieStatus', backref='movie', lazy=True, cascade="all, delete-orphan")


class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'))
    movie_title = db.Column(db.String(200), nullable=False) # Denormalized for flexibility
    rating = db.Column(db.Integer, nullable=False)
    text = db.Column(db.Text)
    poster_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class UserMovieStatus(db.Model):
    __tablename__ = 'user_movie_statuses'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), nullable=False)
    status = db.Column(db.String(50), default='watchlist') # watchlist, watched
    is_favorite = db.Column(db.Boolean, default=False)

    __table_args__ = (db.UniqueConstraint('user_id', 'movie_id', name='_user_movie_status_uc'),)


class PasswordReset(db.Model):
    __tablename__ = 'password_resets'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False, index=True)
    code = db.Column(db.String(10), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class WatchHistory(db.Model):
    __tablename__ = 'watch_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'))
    title = db.Column(db.String(200), nullable=False)
    poster_url = db.Column(db.String(255))
    progress = db.Column(db.Integer, default=100)
    watched_at = db.Column(db.DateTime, default=datetime.utcnow)