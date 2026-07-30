from app import create_app
from app.database.connection import init_db, seed_database

app = create_app()

if __name__ == "__main__":
    init_db()
    seed_database()
    app.run(host="0.0.0.0", port=5555, debug=True)
