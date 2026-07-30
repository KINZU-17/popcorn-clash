# PopcornClash

A gamified sports entertainment and movie discovery web app built with a React frontend and Flask backend.

---

# PROJECT SPECIFICATION OVERVIEW: POPCORNCLASH (MATCHDAY ARENA)

## **1. Executive Concept Summary**
### PopcornClash (Matchday Arena):

- This is a gamified sports entertainment portal and match prediction application built using a React Single-Page Application (SPA) frontend and a Python Flask REST API backend.
- It transforms traditional football match prediction from a solitary dashboard activity into a high-energy, social arcade experience.

- Instead of simple static tracking, users participate in a **"PopcornJam"** watch-party session, where group tracking mechanics synchronize live matches with real-time prediction updates. Users maintain competitive combo streaks, progress through analytical tiers, cast prediction data, and clash against peers across integrated community leaderboards.

### Visual & Aesthetic Brand Guidelines
- The software features a premium, esports gaming arcade style that bridges a digital command center with a football pitch layout:

- Background Framework: Rich pitch-green and deep emerald dark-mode gradients (#06140e to #11121c).

- Accents & Core Highlights: Neon Stadium Yellow/Gold (#ffaa00) reserved for milestone headers, level tracking bars, and active streaks.

- Clash Color Splitting: Electric Red (#ef4444) versus Electric Blue (#3b82f6) to clearly contrast opposing teams on screen.

- Official Branding Asset: An explosive golden popcorn esports shield logo.

## **2. Technical Component Architecture**
### Relational Database Schema Design (Flask SQLAlchemy)
- The backend database is structured across four high-density data models to map out clear data tracking structures:

- User Model (User): Tracks profile configurations (id, username, email, password_hash, favorite_club, current_level, total_xp, prediction_streak).

- Team Model (Team): Represents football entities (id, name, league, stadium, rating_score).

- Fixture Model (Fixture): Models real-world competitive matchups (id, team_home_id (FK), team_away_id (FK), match_date, status).

- Vote Prediction Model (VotePrediction): Manages user forecast interactions (id, user_id (FK), fixture_id (FK), predicted_winner_id, confidence_score).

### Relational Constraints Check:
- **One-to-Many Relationship #1:** A Team can be linked to many Fixtures simultaneously (as either the Home or Away club entry).

- **One-to-Many Relationship #2:** A User can create and scale dozens of unique VotePredictions.

- **Many-to-Many Relationship Matrix:** Users predict many fixtures, and fixtures accumulate hundreds of unique user predictions. These entities are seamlessly joined by the VotePrediction table, which serves as the physical join repository.

# Frontend Client Routing Matrix (React)
- The single-page client shell operates through 8 explicit frontend routes divided cleanly into accessible public feeds and authenticated guard layers:

**1. Public Hub Layer (Accessible to all guests)**

- GET / - Home Feed: Central live match tracking hub mapping active fixtures and global community prediction vote split bars.

- GET /login - Secure portal credential access panel.

- GET /signup - Character profile creation form where players choose their starting username and favorite football club faction.

- GET /forgot-password - Required asynchronous password validation token recovery stream.

**2. Guarded Arena Layer (Protected; JWT Authorization Needed)**

- GET /fixtures/create - Input panel for authorized operators or admins to register a new match showdown.

- GET /match/:id - The PopcornJam Session Arena. The primary feature component containing synchronized match clock feeds, interactive emoji reaction spams, and prediction lock-in panels (POST/PUT hooks).

- GET /leaderboard - Data grid showing the top ranked football teams and top-tier predictors in the community.

- GET /profile - Personal character card showcasing accuracy metrics, earned XP, and active watch combo streaks.

- GET /analytics - Core data dashboard comparing overall league behaviors and prediction payload distribution graphs.

# Flask REST API Endpoint Infrastructure
- The backend engine must handle payload interactions utilizing structured JSON formatting divided symmetrically across all four standard HTTP verbs:

- GET (Read Requests)
- GET /api/fixtures - Returns a collection of active, live, and upcoming matches (Public).

- GET /api/teams/leaderboard - Fetches current standings and performance scores of registered clubs (Public).

- POST (Create Transactions)
- POST /api/predictions - [PROTECTED] Submits a user's initial match outcome prediction and confidence configuration.

- POST /api/fixtures - [PROTECTED] Appends a newly created match schedule to the global tracking matrix.

- PUT (Update Modifications)
- PUT /api/predictions/<id> - [PROTECTED] Enables users to edit or modify their active forecast parameter before physical match kickoff.

- PUT /api/users/profile - [PROTECTED] Updates standard user preferences, credential blocks, or their favorite club allegiance.

- DELETE (Destruction Requests)
- DELETE /api/predictions/<id> - [PROTECTED] Wipes an unwanted user prediction choice from the history matrix.

- DELETE /api/fixtures/<id> - [PROTECTED] System command to purge an aborted or postponed fixture entry from the active database tracking matrix.

# The Direct Step-by-Step Task Allocation for Development
- Do not merge code changes directly into the main branch. Run your tasks inside your designated feature branch paths.
- Always run git pull origin main before starting any development session.
- To begin coding immediately without team merge conflicts, we distributed the architecture cleanly across the team members:

**1. James Nzuki -> (Team Lead & UI Developer)**

**2. Samwel Kamau -> (Forms & Log Engines)**

**3. Aymann faiz -> (Routing & Framework)**


- **Aymann faiz (Routing & Framework Scaffolding):** Establish the root App.jsx skeleton with the 8 layout paths. Build out the shared Navbar and Footer layout templates, ensuring they read the authenticated user context placeholder.

- **Samwel Kamau (Forms & Log Engines):** Focus on dynamic, clean validation states for client onboarding inputs (/login, /signup, /forgot-password) and the match validation layout tools (/fixtures/create).

- **James Nzuki (Gamified Core UI Developer):** Implement the primary interactive interfaces-rendering the real-time simulation tickers on /match/:id (PopcornJam feed) and building the status meters and analytics tables on /dashboard and /profile.













# STRATEGY TO USE FOR DEVELOPING THIS PROJECT'S FRONTEND & BACKEND.
- CREATE RESOURCES FOLDER WITH THE NEEDED FILES
- SQL QUERRING THE DATABASE SCHEMA
- SQL SEEDING THE DATABASE WITH INITIAL DATA
- SETUP FLASK REST API ENDPOINTS
- IMPLEMENT AUTHENTICATION & JWT PROTECTED ROUTES
- code should be scalable and clean
- implement real-time WebSocket integration for live match updates and synchronized user predictions
- make sure there arer no loop holes (debug)
- document all the endpoints and should be 'SHAREABLE' to team
- consuming end point
- authentication and authorization

---

# IMPLEMENTED SPECIFICATION (Current State)

## Tech Stack

### Frontend
- React + Vite
- React Router DOM
- Tailwind CSS (`@theme` + custom utilities)
- Lucide React icons
- Google OAuth (`@react-oauth/google`)

### Backend
- Flask + Flask-CORS
- Flask-RESTful
- Flask-Migrate (Alembic)
- Flask-SQLAlchemy
- Marshmallow (validation/serialization)
- Structlog (JSON logging)
- Flask-Bcrypt (password hashing)
- PyJWT (Google OAuth credential decoding)
- Requests (TMDB client)
- python-dotenv
- psycopg2-binary (PostgreSQL support)
- Gunicorn (production WSGI)

---
# Project Structure
## Frontend Routes

### Public
- `/login` - Sign in
- `/signup` - Create account
- `/forgot-password` - Password reset

### Protected (authenticated)
- `/` - Home feed
- `/movies` - Movie hub
- `/leaderboard` - Rankings
- `/analytics` - Analytics dashboard
- `/profile` - User profile
- `/match/:id` - Match arena
- `/fixtures/create` - Create fixture

## Backend API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth

### Teams
- `GET /api/teams` - List teams
- `GET /api/teams/leaderboard` - Team leaderboard
- `GET /api/teams/<id>` - Get team

### Fixtures
- `GET /api/fixtures` - List fixtures
- `GET /api/fixtures/<id>` - Get fixture
- `POST /api/fixtures` - Create fixture (admin)
- `PATCH /api/fixtures/<id>/status` - Update fixture status (admin)

### Predictions
- `POST /api/predictions` - Create prediction (protected)
- `GET /api/predictions/fixture/<id>` - List predictions for fixture

### Users
- `GET /api/users/profile` - Current user profile (protected)
- `PATCH /api/users/profile` - Update profile (protected)
- `GET /api/users/` - List all users (admin)

### Movies
- `GET /api/movies` - List movies
- `GET /api/movies/<id>` - Get movie
- `POST /api/movies` - Add movie
- `GET /api/movies/status` - Movie statuses
- `PATCH /api/movies/<id>/status` - Update movie status
- `DELETE /api/movies/<id>` - Delete movie

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review
- `PATCH /api/reviews/<id>` - Update review
- `DELETE /api/reviews/<id>` - Delete review

## Setup

### Prerequisites
- Node.js 18+
- Python 3.14
- PostgreSQL (optional; SQLite used by default)

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt  # or: pipenv install

# Environment variables
cp resources/.env.example .env
# Edit .env with your values

# Run migrations (first time)
export FLASK_APP=run.py
flask db init
flask db migrate -m "initial"
flask db upgrade
```

# Start development server
```bash
python3 run.py 
```
```bash
flask run
```

# Or with Gunicorn (production)
```bash
gunicorn -c gunicorn.conf.py wsgi:app 
```
or
```bash
gunicorn run:app
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Environment Variables

### Backend (`backend/.env` or `backend/resources/.env.example`)
- `SECRET_KEY` - Flask secret key
- `DATABASE_URL` - Database URI (defaults to SQLite)
- `POPCORNCLASH_DB_PATH` - SQLite DB path
- `VITE_BACKEND_URL` - Backend URL for frontend
- `TMDB_API_KEY` - TMDB API key

### Frontend (`frontend/.env`)
- `VITE_BACKEND_URL` - Backend API URL
- `VITE_TMDB_API_KEY` - TMDB API key
- `VITE_STREAMING_API_KEY` - Streaming API key
- `VITE_STREAMING_API_HOST` - Streaming API host
- `VITE_FOOTBALL_API_KEY` - Football API key

## Database

### SQLite (default)
```bash
SQLALCHEMY_DATABASE_URI=sqlite:///popcornclash.db
```

### PostgreSQL
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/popcornclash
```

## License

MIT
