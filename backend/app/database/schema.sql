CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    favorite_club TEXT,
    current_level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    prediction_streak INTEGER DEFAULT 0,
    role TEXT DEFAULT 'member'
);

CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    code TEXT,
    league TEXT,
    stadium TEXT,
    rating_score REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS fixtures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_home_id INTEGER NOT NULL,
    team_away_id INTEGER NOT NULL,
    match_date TEXT NOT NULL,
    status TEXT DEFAULT 'SCHEDULED',
    FOREIGN KEY (team_home_id) REFERENCES teams(id),
    FOREIGN KEY (team_away_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS vote_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    fixture_id INTEGER NOT NULL,
    predicted_winner_id INTEGER,
    confidence_score INTEGER DEFAULT 50,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (fixture_id) REFERENCES fixtures(id),
    FOREIGN KEY (predicted_winner_id) REFERENCES teams(id),
    UNIQUE(user_id, fixture_id)
);

CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id INTEGER UNIQUE,
    title TEXT NOT NULL,
    overview TEXT,
    poster_url TEXT,
    genre TEXT,
    year INTEGER,
    rating REAL,
    duration TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    movie_title TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    poster_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_movie_statuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    status TEXT DEFAULT 'watchlist',
    is_favorite INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (movie_id) REFERENCES movies(id),
    UNIQUE(user_id, movie_id)
);

CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);


