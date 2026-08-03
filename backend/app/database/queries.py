from datetime import datetime
from typing import Optional
from app.utils.auth import get_online_user_ids
from .connection import get_cursor
import random


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


def search_users(query: str = "", current_user_id: int | None = None) -> list[dict]:
    with get_cursor() as cur:
        limit_clause = "LIMIT 50" if query else ""  # No limit for admin fetching all users
        search_pattern = f"%{query}%" if query else "%"
        if current_user_id:
            cur.execute(f"""
                SELECT id, username, email, favorite_club, current_level, total_xp, role, is_banned
                FROM users
                WHERE id != ? AND (username LIKE ? OR email LIKE ?)
                ORDER BY username ASC
                {limit_clause}
            """, (current_user_id, search_pattern, search_pattern))
        else:
            cur.execute(f"""
                SELECT id, username, email, favorite_club, current_level, total_xp, role, is_banned
                FROM users
                WHERE username LIKE ? OR email LIKE ?
                ORDER BY username ASC
                {limit_clause}
            """, (search_pattern, search_pattern))
        users = [dict(row) for row in cur.fetchall()]
        online_user_ids = get_online_user_ids()
        for user in users:
            user['is_online'] = user['id'] in online_user_ids
        return users


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
        return [dict(row) for row in cur.fetchall()] # Kept for non-paginated calls


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


def get_all_movies(limit: int = 50, page: int = 1, per_page: int = 10, paginated: bool = False) -> list[dict] | dict:
    with get_cursor() as cur:
        if paginated:
            offset = (page - 1) * per_page
            cur.execute("SELECT COUNT(*) as count FROM movies")
            total = cur.fetchone()['count']
            cur.execute("SELECT * FROM movies ORDER BY year DESC, rating DESC LIMIT ? OFFSET ?", (per_page, offset))
            movies = [dict(row) for row in cur.fetchall()]
            return {
                "movies": movies,
                "pagination": {"total": total, "page": page, "per_page": per_page, "pages": (total + per_page - 1) // per_page}
            }

        if limit > 0:
            cur.execute("SELECT * FROM movies ORDER BY year DESC, rating DESC LIMIT ?", (limit,))
        else: # limit 0 means all
            cur.execute("SELECT * FROM movies ORDER BY year DESC, rating DESC")
        
        movies = [dict(row) for row in cur.fetchall()]
        return {"movies": movies}


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


def get_all_reviews(page: int = 1, per_page: int = 10, paginated: bool = False) -> list[dict] | dict:
    with get_cursor() as cur:
        if paginated:
            offset = (page - 1) * per_page
            cur.execute("SELECT COUNT(*) as count FROM reviews")
            total = cur.fetchone()['count']
            cur.execute("SELECT * FROM reviews ORDER BY created_at DESC LIMIT ? OFFSET ?", (per_page, offset))
            reviews = [dict(row) for row in cur.fetchall()]
            return {
                "reviews": reviews,
                "pagination": {"total": total, "page": page, "per_page": per_page, "pages": (total + per_page - 1) // per_page}
            }

        cur.execute("SELECT * FROM reviews ORDER BY created_at DESC")
        reviews = [dict(row) for row in cur.fetchall()]
        return {
            "reviews": reviews
        }


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


def delete_movie(movie_id: int) -> None:
    with get_cursor() as cur:
        cur.execute("DELETE FROM user_movie_statuses WHERE movie_id = ?", (movie_id,))
        cur.execute("DELETE FROM movies WHERE id = ?", (movie_id,))


def get_user_movie_statuses(user_id: int) -> dict:
    with get_cursor() as cur:
        cur.execute("SELECT movie_id, status, is_favorite FROM user_movie_statuses WHERE user_id = ?", (user_id,))
        rows = cur.fetchall()
        return {
            row["movie_id"]: {
                "status": row["status"],
                "is_favorite": bool(row["is_favorite"])
            } for row in rows
        }


def update_user_movie_status(user_id: int, movie_id: int, status: str = None, is_favorite: bool = None) -> None:
    with get_cursor() as cur:
        # Check if already exists
        cur.execute("SELECT status, is_favorite FROM user_movie_statuses WHERE user_id = ? AND movie_id = ?", (user_id, movie_id))
        row = cur.fetchone()
        
        if row:
            # Update existing
            new_status = status if status is not None else row["status"]
            new_fav = int(is_favorite) if is_favorite is not None else row["is_favorite"]
            cur.execute(
                "UPDATE user_movie_statuses SET status = ?, is_favorite = ? WHERE user_id = ? AND movie_id = ?",
                (new_status, new_fav, user_id, movie_id)
            )
        else:
            # Insert new
            new_status = status if status is not None else 'watchlist'
            new_fav = int(is_favorite) if is_favorite is not None else 0
            cur.execute(
                "INSERT INTO user_movie_statuses (user_id, movie_id, status, is_favorite) VALUES (?, ?, ?, ?)",
                (user_id, movie_id, new_status, new_fav)
            )


def create_password_reset(email: str, code: str, expires_at: str) -> None:
    with get_cursor() as cur:
        # Invalidate prior unused codes for this email
        cur.execute("UPDATE password_resets SET used = 1 WHERE email = ?", (email,))
        cur.execute(
            "INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)",
            (email, code, expires_at),
        )


def verify_and_use_reset_code(email: str, code: str) -> bool:
    with get_cursor() as cur:
        cur.execute(
            "SELECT id, expires_at, used FROM password_resets WHERE email = ? AND code = ? AND used = 0 ORDER BY id DESC LIMIT 1",
            (email, code),
        )
        row = cur.fetchone()
        if not row:
            return False

        # Mark as used
        cur.execute("UPDATE password_resets SET used = 1 WHERE id = ?", (row["id"],))
        return True


def update_user_password(email: str, password_hash: str) -> None:
    with get_cursor() as cur:
        cur.execute("UPDATE users SET password_hash = ? WHERE email = ?", (password_hash, email))


# ── Watch History ──

def create_watch_history_entry(user_id: int, movie_id: int | None, title: str, poster_url: str = "", progress: int = 100) -> int:
    with get_cursor() as cur:
        cur.execute(
            "INSERT INTO watch_history (user_id, movie_id, title, poster_url, progress) VALUES (?, ?, ?, ?, ?)",
            (user_id, movie_id, title, poster_url, progress),
        )
        return cur.lastrowid


def get_user_watch_history(user_id: int, limit: int = 50) -> list[dict]:
    with get_cursor() as cur:
        cur.execute(
            "SELECT * FROM watch_history WHERE user_id = ? ORDER BY watched_at DESC LIMIT ?",
            (user_id, limit),
        )
        return [dict(row) for row in cur.fetchall()]


def delete_watch_history_entry(entry_id: int, user_id: int) -> None:
    with get_cursor() as cur:
        cur.execute("DELETE FROM watch_history WHERE id = ? AND user_id = ?", (entry_id, user_id))


# ── Admin ──

def update_user_role(user_id: int, role: str) -> None:
    with get_cursor() as cur:
        cur.execute("UPDATE users SET role = ? WHERE id = ?", (role, user_id))


def update_user_ban_status(user_id: int, is_banned: bool) -> None:
    with get_cursor() as cur:
        cur.execute("UPDATE users SET is_banned = ? WHERE id = ?", (int(is_banned), user_id))


def delete_user(user_id: int) -> None:
    with get_cursor() as cur:
        cur.execute("DELETE FROM watch_history WHERE user_id = ?", (user_id,))
        cur.execute("DELETE FROM reviews WHERE user_id = ?", (user_id,))
        cur.execute("DELETE FROM vote_predictions WHERE user_id = ?", (user_id,))
        cur.execute("DELETE FROM user_movie_statuses WHERE user_id = ?", (user_id,))
        cur.execute("DELETE FROM password_resets WHERE email = (SELECT email FROM users WHERE id = ?)", (user_id,))
        cur.execute("DELETE FROM users WHERE id = ?", (user_id,))


def get_stats() -> dict:
    with get_cursor() as cur:
        cur.execute("SELECT COUNT(*) AS c FROM users")
        users = cur.fetchone()["c"]
        cur.execute("SELECT COUNT(*) AS c FROM movies")
        movies = cur.fetchone()["c"]
        cur.execute("SELECT COUNT(*) AS c FROM reviews")
        reviews = cur.fetchone()["c"]
        cur.execute("SELECT COUNT(*) AS c FROM fixtures")
        fixtures = cur.fetchone()["c"]
        cur.execute("SELECT COUNT(*) AS c FROM watch_history")
        history = cur.fetchone()["c"]
        return {
            "total_users": users,
            "total_movies": movies,
            "total_reviews": reviews,
            "total_fixtures": fixtures,
            "total_watch_history": history,
        }
