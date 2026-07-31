import os
from pathlib import Path
from dotenv import load_dotenv

# Explicitly load .env from the root folder
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

from flask import Flask
from flask_cors import CORS
from config import Config

from app.routes.auth import auth_bp
from app.routes.users import users_bp
from app.routes.teams import teams_bp
from app.routes.fixtures import fixtures_bp
from app.routes.predictions import predictions_bp
from app.routes.movies import movies_bp
from app.routes.reviews import reviews_bp


def create_app():
    app = Flask(__name__)

    # DEBUG: Check if .env loaded properly when server starts
    print("--- ENV CHECK START ---")
    print("SMTP_SERVER:", os.environ.get("SMTP_SERVER"))
    print("SMTP_USERNAME:", os.environ.get("SMTP_USERNAME"))
    print("SMTP_PASSWORD Set?:", bool(os.environ.get("SMTP_PASSWORD")))
    print("--- ENV CHECK END ---")

    app.config.from_object(Config)
    CORS(app)  # Enable CORS for all routes

    @app.route("/")
    def home():
        return "Welcome to the Popcorn Clash API!"

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(teams_bp)
    app.register_blueprint(fixtures_bp)
    app.register_blueprint(predictions_bp)
    app.register_blueprint(movies_bp)
    app.register_blueprint(reviews_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5555)), debug=True)