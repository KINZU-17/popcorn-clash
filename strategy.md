# TO DO:
1. Backend — Install dependencies and run
```BASH
cd popcornclash/backend && pipenv install
```

2. Frontend — Install dependencies (already done) and run
```BASH
cd popcornclash/frontend && npm install
```

3. Run both servers
Terminal 1 — Backend:
```BASH
cd popcornclash/backend && pipenv run python run.py
```

Terminal 2 — Frontend:
```BASH
cd popcornclash/frontend && npm run dev
```

- The backend runs on http://localhost:5555 and the frontend dev server on http://localhost:5173 (Vite default). The frontend config.py has BACKEND_URL defaulting to http://localhost:5000, so you may also need to set the env variable when running the frontend if the backend port differs:

```BASH
cd popcornclash/frontend && VITE_BACKEND_URL=http://localhost:5555 npm run dev
```


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

- use everything in the pipfile
i.e structlog -> log.error => it is very important