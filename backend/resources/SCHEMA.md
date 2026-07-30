# PopcornClash Database Schema

## Tables

### users
- id (PK, auto-increment)
- username (unique, not null)
- email (unique, not null)
- password_hash (not null)
- favorite_club
- current_level (default: 1)
- total_xp (default: 0)
- prediction_streak (default: 0)
- role (default: 'member')

### teams
- id (PK, auto-increment)
- name (unique, not null)
- code
- league
- stadium
- rating_score (default: 0)

### fixtures
- id (PK, auto-increment)
- team_home_id (FK -> teams.id)
- team_away_id (FK -> teams.id)
- match_date (not null)
- status (default: 'SCHEDULED')

### vote_predictions
- id (PK, auto-increment)
- user_id (FK -> users.id)
- fixture_id (FK -> fixtures.id)
- predicted_winner_id (FK -> teams.id, nullable)
- confidence_score (default: 50)
- created_at (default: CURRENT_TIMESTAMP)
- UNIQUE(user_id, fixture_id)

### movies
- id (PK, auto-increment)
- tmdb_id (unique, nullable)
- title (not null)
- overview
- poster_url
- genre
- year
- rating
- duration
- created_at (default: CURRENT_TIMESTAMP)

### reviews
- id (PK, auto-increment)
- user_id (FK -> users.id)
- movie_title (not null)
- rating (1-5)
- text (not null)
- poster_url
- created_at (default: CURRENT_TIMESTAMP)