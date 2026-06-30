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

- GET / — Home Feed: Central live match tracking hub mapping active fixtures and global community prediction vote split bars.

- GET /login — Secure portal credential access panel.

- GET /signup — Character profile creation form where players choose their starting username and favorite football club faction.

- GET /forgot-password — Required asynchronous password validation token recovery stream.

**2. Guarded Arena Layer (Protected; JWT Authorization Needed)**

- GET /fixtures/create — Input panel for authorized operators or admins to register a new match showdown.

- GET /match/:id — The PopcornJam Session Arena. The primary feature component containing synchronized match clock feeds, interactive emoji reaction spams, and prediction lock-in panels (POST/PUT hooks).

- GET /leaderboard — Data grid showing the top ranked football teams and top-tier predictors in the community.

- GET /profile — Personal character card showcasing accuracy metrics, earned XP, and active watch combo streaks.

- GET /analytics — Core data dashboard comparing overall league behaviors and prediction payload distribution graphs.

# Flask REST API Endpoint Infrastructure
- The backend engine must handle payload interactions utilizing structured JSON formatting divided symmetrically across all four standard HTTP verbs:

- GET (Read Requests)
- GET /api/fixtures — Returns a collection of active, live, and upcoming matches (Public).

- GET /api/teams/leaderboard — Fetches current standings and performance scores of registered clubs (Public).

- POST (Create Transactions)
- POST /api/predictions — [PROTECTED] Submits a user's initial match outcome prediction and confidence configuration.

- POST /api/fixtures — [PROTECTED] Appends a newly created match schedule to the global tracking matrix.

- PUT (Update Modifications)
- PUT /api/predictions/<id> — [PROTECTED] Enables users to edit or modify their active forecast parameter before physical match kickoff.

- PUT /api/users/profile — [PROTECTED] Updates standard user preferences, credential blocks, or their favorite club allegiance.

- DELETE (Destruction Requests)
- DELETE /api/predictions/<id> — [PROTECTED] Wipes an unwanted user prediction choice from the history matrix.

- DELETE /api/fixtures/<id> — [PROTECTED] System command to purge an aborted or postponed fixture entry from the active database tracking matrix.

# The Direct Step-by-Step Task Allocation for Development
- Do not merge code changes directly into the main branch. Run your tasks inside your designated feature branch paths.
- Always run git pull origin main before starting any development session.
- To begin coding immediately without team merge conflicts, we distributed the architecture cleanly across the team members:

**1. James Nzuki -> (Team Lead & UI Developer)**

**2. Samwel Kamau -> (Forms & Log Engines)**

**3. Aymann faiz -> (Routing & Framework)**


- **Aymann faiz (Routing & Framework Scaffolding):** Establish the root App.jsx skeleton with the 8 layout paths. Build out the shared Navbar and Footer layout templates, ensuring they read the authenticated user context placeholder.

- **Samwel Kamau (Forms & Log Engines):** Focus on dynamic, clean validation states for client onboarding inputs (/login, /signup, /forgot-password) and the match validation layout tools (/fixtures/create).

- **James Nzuki (Gamified Core UI Developer):** Implement the primary interactive interfaces—rendering the real-time simulation tickers on /match/:id (PopcornJam feed) and building the status meters and analytics tables on /dashboard and /profile.
