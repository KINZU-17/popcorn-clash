from datetime import datetime
from typing import Optional
from .connection import get_cursor


def get_user_by_email(email: str) -> Optional[dict]:
    with get_cursor() as cur:
        cur.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cur.fetchone()
        return dict(row) if row else None


def get_user_by_username(username: str) -> Optional[dict]:
    with get_cursor() as cur:
        cur.execute("SELECT * FROM users WHERE username = ?", (username,))
        row = cur.fetchone()
        return dict(row) if row else None


def create_user(username: str, email: str, password_hash: str, favorite_club: str = "") -> int:
    with get_cursor() as cur:
        cur.execute(
            "INSERT INTO users (username, email, password_hash, favorite_club) VALUES (?, ?, ?, ?)",
            (username, email, password_hash, favorite_club),
        )
        return cur.lastrowid


def get_user_by_id(user_id: int) -> Optional[dict]:
    with get_cursor() as cur:
        cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def update_user_profile(user_id: int, **kwargs) -> None:
    if not kwargs:
        return
    set_clause = ", ".join(f"{key} = ?" for key in kwargs.keys())
    values = list(kwargs.values()) + [user_id]
    with get_cursor() as cur:
        cur.execute(f"UPDATE users SET {set_clause} WHERE id = ?", values)


def get_team_by_id(team_id: int) -> Optional[dict]:
    with get_cursor() as cur:
        cur.execute("SELECT * FROM teams WHERE id = ?", (team_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def create_team(name: str, league: str, stadium: str = "", rating_score: float = 0.0) -> int:
    with get_cursor() as cur:
        cur.execute(
            "INSERT INTO teams (name, league, stadium, rating_score) VALUES (?, ?, ?, ?)",
            (name, league, stadium, rating_score),
        )
        return cur.lastrowid


def get_all_teams() -> list[dict]:
    with get_cursor() as cur:
        cur.execute("SELECT * FROM teams ORDER BY rating_score DESC")
        return [dict(row) for row in cur.fetchall()]


def get_fixture(fixture_id: int) -> Optional[dict]:
    with get_cursor() as cur:
        cur.execute("""
            SELECT f.*,
                   h.name AS home_name, h.code AS home_code, h.league AS home_league,
                   a.name AS away_name, a.code AS away_code, a.league AS away_league
            FROM fixtures f
            JOIN teams h ON f.team_home_id = h.id
            JOIN teams a ON f.team_away_id = a.id
            WHERE f.id = ?
        """, (fixture_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def get_all_fixtures() -> list[dict]:
    with get_cursor() as cur:
        cur.execute("""
            SELECT f.*,
                   h.name AS home_name, h.code AS home_code,
                   a.name AS away_name, a.code AS away_code
            FROM fixtures f
            JOIN teams h ON f.team_home_id = h.id
            JOIN teams a ON f.team_away_id = a.id
            ORDER BY f.match_date ASC
        """)
        return [dict(row) for row in cur.fetchall()]


def create_fixture(team_home_id: int, team_away_id: int, match_date: str, status: str = "SCHEDULED") -> int:
    with get_cursor() as cur:
        cur.execute(
            "INSERT INTO fixtures (team_home_id, team_away_id, match_date, status) VALUES (?, ?, ?, ?)",
            (team_home_id, team_away_id, match_date, status),
        )
        return cur.lastrowid


def update_fixture_status(fixture_id: int, status: str) -> None:
    with get_cursor() as cur:
        cur.execute("UPDATE fixtures SET status = ? WHERE id = ?", (status, fixture_id))


def create_prediction(user_id: int, fixture_id: int, predicted_winner_id: int | None, confidence: int) -> int:
    with get_cursor() as cur:
        cur.execute(
            """INSERT INTO vote_predictions (user_id, fixture_id, predicted_winner_id, confidence_score)
               VALUES (?, ?, ?, ?)
               ON CONFLICT(user_id, fixture_id) DO UPDATE SET
               predicted_winner_id = excluded.predicted_winner_id,
               confidence_score = excluded.confidence_score""",
            (user_id, fixture_id, predicted_winner_id, confidence),
        )
        return cur.lastrowid


def get_predictions_for_fixture(fixture_id: int) -> list[dict]:
    with get_cursor() as cur:
        cur.execute("""
            SELECT vp.*, u.username
            FROM vote_predictions vp
            JOIN users u ON vp.user_id = u.id
            WHERE vp.fixture_id = ?
            ORDER BY vp.created_at DESC
        """, (fixture_id,))
        return [dict(row) for row in cur.fetchall()]


def get_user_predictions(user_id: int) -> list[dict]:
    with get_cursor() as cur:
        cur.execute("""
            SELECT vp.*, f.match_date, h.name AS home_name, a.name AS away_name
            FROM vote_predictions vp
            JOIN fixtures f ON vp.fixture_id = f.id
            JOIN teams h ON f.team_home_id = h.id
            JOIN teams a ON f.team_away_id = a.id
            WHERE vp.user_id = ?
            ORDER BY vp.created_at DESC
        """, (user_id,))
        return [dict(row) for row in cur.fetchall()]


def get_leaderboard(limit: int = 50) -> list[dict]:
    with get_cursor() as cur:
        cur.execute("""
            SELECT u.username, u.total_xp, u.prediction_streak, u.favorite_club,
                   COUNT(vp.id) AS total_predictions,
                   SUM(CASE WHEN vp.predicted_winner_id = f.team_home_id AND f.status = 'FINISHED' THEN 1 ELSE 0 END) AS correct_predictions
            FROM users u
            LEFT JOIN vote_predictions vp ON u.id = vp.user_id
            LEFT JOIN fixtures f ON vp.fixture_id = f.id
            GROUP BY u.id
            ORDER BY u.total_xp DESC
            LIMIT ?
        """, (limit,))
        return [dict(row) for row in cur.fetchall()]


def create_movie(tmdb_id, title, overview, poster_url, genre, year, rating, duration) -> int:
    with get_cursor() as cur:
        cur.execute(
            """INSERT INTO movies (tmdb_id, title, overview, poster_url, genre, year, rating, duration)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(tmdb_id) DO UPDATE SET
               title = excluded.title,
               overview = excluded.overview,
               poster_url = excluded.poster_url,
               genre = excluded.genre,
               year = excluded.year,
               rating = excluded.rating,
               duration = excluded.duration""",
            (tmdb_id, title, overview, poster_url, genre, year, rating, duration),
        )
        return cur.lastrowid


def get_all_movies(limit: int = 50) -> list[dict]:
    with get_cursor() as cur:
        cur.execute("SELECT * FROM movies ORDER BY year DESC, rating DESC LIMIT ?", (limit,))
        return [dict(row) for row in cur.fetchall()]


def get_movie_by_id(movie_id: int) -> dict | None:
    with get_cursor() as cur:
        cur.execute("SELECT * FROM movies WHERE id = ?", (movie_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def create_review(user_id: int, movie_title: str, rating: int, text: str, poster_url: str = "") -> int:
    with get_cursor() as cur:
        cur.execute(
            "INSERT INTO reviews (user_id, movie_title, rating, text, poster_url) VALUES (?, ?, ?, ?, ?)",
            (user_id, movie_title, rating, text, poster_url),
        )
        return cur.lastrowid


def get_all_reviews() -> list[dict]:
    with get_cursor() as cur:
        cur.execute("SELECT * FROM reviews ORDER BY created_at DESC")
        return [dict(row) for row in cur.fetchall()]


def update_review(review_id: int, **kwargs) -> None:
    if not kwargs:
        return
    set_clause = ", ".join(f"{key} = ?" for key in kwargs.keys())
    values = list(kwargs.values()) + [review_id]
    with get_cursor() as cur:
        cur.execute(f"UPDATE reviews SET {set_clause} WHERE id = ?", values)


def delete_review(review_id: int) -> None:
    with get_cursor() as cur:
        cur.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
