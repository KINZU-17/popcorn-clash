from datetime import datetime
from typing import Optional
from sqlalchemy import func, or_
from app.extensions import db
from app.models import ( # This should be app.models, not app.models.models
    User, Team, Fixture, VotePrediction, Movie, Review,
    UserMovieStatus, PasswordReset, WatchHistory
)


def get_user_by_email(email: str) -> Optional[dict]:
    user = User.query.filter_by(email=email).first()
    return user.__dict__ if user else None


def get_user_by_username(username: str) -> Optional[dict]:
    user = User.query.filter_by(username=username).first()
    return user.__dict__ if user else None


def create_user(username: str, email: str, password_hash: str, favorite_club: str = "") -> int:
    new_user = User(username=username, email=email, password_hash=password_hash, favorite_club=favorite_club)
    db.session.add(new_user)
    db.session.commit()
    return new_user.id


def search_users(query: str = "", current_user_id: int | None = None) -> list[dict]:
    from app.utils.auth import get_online_user_ids
    
    base_query = User.query
    if query:
        search_pattern = f"%{query}%"
        base_query = base_query.filter(or_(User.username.like(search_pattern), User.email.like(search_pattern)))
        base_query = base_query.limit(50)

    if current_user_id:
        base_query = base_query.filter(User.id != current_user_id)

    users_obj = base_query.order_by(User.username.asc()).all()
    
    users = []
    online_user_ids = get_online_user_ids()
    for u in users_obj:
        user_dict = {c.name: getattr(u, c.name) for c in u.__table__.columns}
        user_dict['is_online'] = u.id in online_user_ids
        users.append(user_dict)

    return users


def get_user_by_id(user_id: int) -> Optional[dict]:
    user = User.query.get(user_id)
    return user.__dict__ if user else None


def update_user_profile(user_id: int, **kwargs) -> None:
    if not kwargs:
        return
    User.query.filter_by(id=user_id).update(kwargs)
    db.session.commit()


def get_team_by_id(team_id: int) -> Optional[dict]:
    team = Team.query.get(team_id)
    return team.__dict__ if team else None


def create_team(name: str, league: str, stadium: str = "", rating_score: float = 0.0) -> int:
    new_team = Team(name=name, league=league, stadium=stadium, rating_score=rating_score)
    db.session.add(new_team)
    db.session.commit()
    return new_team.id


def get_all_teams() -> list[dict]:
    teams = Team.query.order_by(Team.rating_score.desc()).all()
    return [t.__dict__ for t in teams]


def get_fixture(fixture_id: int) -> Optional[dict]:
    fixture = Fixture.query.options(
        db.joinedload(Fixture.home_team),
        db.joinedload(Fixture.away_team)
    ).get(fixture_id)
    if not fixture:
        return None
    
    fixture_dict = fixture.__dict__
    fixture_dict['home_name'] = fixture.home_team.name
    fixture_dict['home_code'] = fixture.home_team.code
    fixture_dict['league'] = fixture.home_team.league
    fixture_dict['away_name'] = fixture.away_team.name
    fixture_dict['away_code'] = fixture.away_team.code
    fixture_dict['away_league'] = fixture.away_team.league
    return fixture_dict


def get_all_fixtures() -> list[dict]:
    fixtures = Fixture.query.options(
        db.joinedload(Fixture.home_team),
        db.joinedload(Fixture.away_team)
    ).order_by(Fixture.match_date.asc()).all()

    results = []
    for f in fixtures:
        f_dict = {c.name: getattr(f, c.name) for c in f.__table__.columns}
        f_dict['home_name'] = f.home_team.name
        f_dict['home_code'] = f.home_team.code
        f_dict['league'] = f.home_team.league
        f_dict['away_name'] = f.away_team.name
        f_dict['away_code'] = f.away_team.code
        results.append(f_dict)
    return results


def create_fixture(team_home_id: int, team_away_id: int, match_date: str, status: str = "SCHEDULED") -> int:
    new_fixture = Fixture(
        team_home_id=team_home_id,
        team_away_id=team_away_id,
        match_date=datetime.fromisoformat(match_date),
        status=status
    )
    db.session.add(new_fixture)
    db.session.commit()
    return new_fixture.id


def update_fixture_status(fixture_id: int, status: str) -> None:
    fixture = Fixture.query.get(fixture_id)
    if fixture:
        fixture.status = status
        db.session.commit()


def create_prediction(user_id: int, fixture_id: int, predicted_winner_id: int | None, confidence: int) -> int:
    prediction = VotePrediction.query.filter_by(user_id=user_id, fixture_id=fixture_id).first()
    if prediction:
        prediction.predicted_winner_id = predicted_winner_id
        prediction.confidence_score = confidence
    else:
        prediction = VotePrediction(
            user_id=user_id,
            fixture_id=fixture_id,
            predicted_winner_id=predicted_winner_id,
            confidence_score=confidence
        )
        db.session.add(prediction)
    db.session.commit()
    return prediction.id


def get_predictions_for_fixture(fixture_id: int) -> list[dict]:
    predictions = VotePrediction.query.join(User).filter(VotePrediction.fixture_id == fixture_id).order_by(VotePrediction.created_at.desc()).all()
    results = []
    for p in predictions:
        p_dict = {c.name: getattr(p, c.name) for c in p.__table__.columns}
        p_dict['username'] = p.user.username
        results.append(p_dict)
    return results


def get_user_predictions(user_id: int) -> list[dict]:
    predictions = VotePrediction.query.filter_by(user_id=user_id).join(Fixture).order_by(VotePrediction.created_at.desc()).all()
    results = []
    for p in predictions:
        p_dict = {c.name: getattr(p, c.name) for c in p.__table__.columns}
        p_dict['match_date'] = p.fixture.match_date
        p_dict['home_name'] = p.fixture.home_team.name
        p_dict['away_name'] = p.fixture.away_team.name
        results.append(p_dict)
    return results


def get_leaderboard(limit: int = 50) -> list[dict]:
    # This is a complex aggregation, might be easier to keep as raw SQL or use more advanced SQLAlchemy
    # For now, converting to ORM equivalent
    results = db.session.query(
        User.username,
        User.total_xp,
        User.prediction_streak,
        User.favorite_club,
        func.count(VotePrediction.id).label('total_predictions'),
        func.sum(case((and_(VotePrediction.predicted_winner_id == Fixture.team_home_id, Fixture.status == 'FINISHED'), 1), else_=0)).label('correct_predictions')
    ).outerjoin(VotePrediction, User.id == VotePrediction.user_id)\
     .outerjoin(Fixture, VotePrediction.fixture_id == Fixture.id)\
     .group_by(User.id)\
     .order_by(User.total_xp.desc())\
     .limit(limit).all()
    return [dict(row) for row in results]


def create_movie(tmdb_id, title, overview, poster_url, genre, year, rating, duration) -> int:
    movie = Movie.query.filter_by(tmdb_id=tmdb_id).first()
    if movie:
        movie.title = title
        movie.overview = overview
        movie.poster_url = poster_url
        movie.genre = genre
        movie.year = year
        movie.rating = rating
        movie.duration = duration
    else:
        movie = Movie(tmdb_id=tmdb_id, title=title, overview=overview, poster_url=poster_url, genre=genre, year=year, rating=rating, duration=duration)
        db.session.add(movie)
    db.session.commit()
    return movie.id


def get_all_movies(limit: int = 50, page: int = 1, per_page: int = 10, paginated: bool = False) -> list[dict] | dict:
    query = Movie.query.order_by(Movie.year.desc(), Movie.rating.desc())
    if paginated:
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            "movies": [m.__dict__ for m in pagination.items],
            "pagination": {
                "total": pagination.total,
                "page": pagination.page,
                "per_page": pagination.per_page,
                "pages": pagination.pages
            }
        }

    if limit > 0:
        query = query.limit(limit)
    
    movies = [m.__dict__ for m in query.all()]
    return {"movies": movies}


def get_movie_by_id(movie_id: int) -> dict | None:
    movie = Movie.query.get(movie_id)
    return movie.__dict__ if movie else None


def create_review(user_id: int, movie_title: str, rating: int, text: str, poster_url: str = "") -> int:
    new_review = Review(user_id=user_id, movie_title=movie_title, rating=rating, text=text, poster_url=poster_url)
    db.session.add(new_review)
    db.session.commit()
    return new_review.id


def get_all_reviews(page: int = 1, per_page: int = 10, paginated: bool = False) -> list[dict] | dict:
    query = Review.query.order_by(Review.created_at.desc())
    if paginated:
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            "reviews": [r.__dict__ for r in pagination.items],
            "pagination": {
                "total": pagination.total,
                "page": pagination.page,
                "per_page": pagination.per_page,
                "pages": pagination.pages
            }
        }
    reviews = [r.__dict__ for r in query.all()]
    return {"reviews": reviews}


def update_review(review_id: int, **kwargs) -> None:
    if not kwargs:
        return
    Review.query.filter_by(id=review_id).update(kwargs)
    db.session.commit()


def delete_review(review_id: int) -> None:
    review = Review.query.get(review_id)
    if review:
        db.session.delete(review)
        db.session.commit()


def delete_movie(movie_id: int) -> None:
    movie = Movie.query.get(movie_id)
    if movie:
        db.session.delete(movie)
        db.session.commit()


def get_user_movie_statuses(user_id: int) -> dict:
    statuses = UserMovieStatus.query.filter_by(user_id=user_id).all()
    return {
        s.movie_id: {"status": s.status, "is_favorite": s.is_favorite}
        for s in statuses
    }


def update_user_movie_status(user_id: int, movie_id: int, status: str = None, is_favorite: bool = None) -> None:
    ums = UserMovieStatus.query.filter_by(user_id=user_id, movie_id=movie_id).first()
    if ums:
        if status is not None:
            ums.status = status
        if is_favorite is not None:
            ums.is_favorite = is_favorite
    else:
        ums = UserMovieStatus(user_id=user_id, movie_id=movie_id)
        if status is not None:
            ums.status = status
        if is_favorite is not None:
            ums.is_favorite = is_favorite
        db.session.add(ums)
    db.session.commit()


def create_password_reset(email: str, code: str, expires_at: str) -> None:
    PasswordReset.query.filter_by(email=email, used=False).update({"used": True})
    new_reset = PasswordReset(email=email, code=code, expires_at=datetime.fromisoformat(expires_at))
    db.session.add(new_reset)
    db.session.commit()


def verify_and_use_reset_code(email: str, code: str) -> bool:
    reset_req = PasswordReset.query.filter_by(email=email, code=code, used=False).order_by(PasswordReset.id.desc()).first()
    if not reset_req or reset_req.expires_at < datetime.utcnow():
        return False
    
    reset_req.used = True
    db.session.commit()
    return True


def update_user_password(email: str, password_hash: str) -> None:
    user = User.query.filter_by(email=email).first()
    if user:
        user.password_hash = password_hash
        db.session.commit()


# ── Watch History ──

def create_watch_history_entry(user_id: int, movie_id: int | None, title: str, poster_url: str = "", progress: int = 100) -> int:
    entry = WatchHistory(user_id=user_id, movie_id=movie_id, title=title, poster_url=poster_url, progress=progress)
    db.session.add(entry)
    db.session.commit()
    return entry.id


def get_user_watch_history(user_id: int, limit: int = 50) -> list[dict]:
    history = WatchHistory.query.filter_by(user_id=user_id).order_by(WatchHistory.watched_at.desc()).limit(limit).all()
    return [h.__dict__ for h in history]


def delete_watch_history_entry(entry_id: int, user_id: int) -> None:
    entry = WatchHistory.query.filter_by(id=entry_id, user_id=user_id).first()
    if entry:
        db.session.delete(entry)
        db.session.commit()


# ── Admin ──

def update_user_role(user_id: int, role: str) -> None:
    user = User.query.get(user_id)
    if user:
        user.role = role
        db.session.commit()


def update_user_ban_status(user_id: int, is_banned: bool) -> None:
    user = User.query.get(user_id)
    if user:
        user.is_banned = is_banned
        db.session.commit()


def delete_user(user_id: int) -> None:
    user = User.query.get(user_id)
    if user:
        PasswordReset.query.filter_by(email=user.email).delete()
        db.session.delete(user)
        db.session.commit()


def get_stats() -> dict:
    return {
        "total_users": db.session.query(func.count(User.id)).scalar(),
        "total_movies": db.session.query(func.count(Movie.id)).scalar(),
        "total_reviews": db.session.query(func.count(Review.id)).scalar(),
        "total_fixtures": db.session.query(func.count(Fixture.id)).scalar(),
        "total_watch_history": db.session.query(func.count(WatchHistory.id)).scalar(),
    }
