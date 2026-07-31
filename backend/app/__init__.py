import os
from pathlib import Path
from dotenv import load_dotenv

# Ensure environment variables are loaded BEFORE blueprints/utils import
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_migrate import Migrate
from app.extensions import db
from app.database.connection import init_db, seed_database
from app.utils.logger import logger


def create_app():
    app = Flask(__name__)
    app.config.from_object("config.config")
    CORS(app)

    db.init_app(app)
    Migrate(app, db)

    @app.after_request
    def log_request(response):
        logger.info(
            "request",
            method=request.method,
            path=request.path,
            status=response.status_code,
            remote_addr=request.remote_addr,
        )
        return response

    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.error("unhandled_exception", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

    with app.app_context():
        init_db()
        seed_database()

    # Import blueprints after env vars are loaded
    from app.routes.auth import auth_bp
    from app.routes.teams import teams_bp
    from app.routes.fixtures import fixtures_bp
    from app.routes.predictions import predictions_bp
    from app.routes.users import users_bp
    from app.routes.movies import movies_bp
    from app.routes.reviews import reviews_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(teams_bp)
    app.register_blueprint(fixtures_bp)
    app.register_blueprint(predictions_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(movies_bp)
    app.register_blueprint(reviews_bp)

    logger.info(
        "Application initialized",
        routes=[
            "auth",
            "teams",
            "fixtures",
            "predictions",
            "users",
            "movies",
            "reviews",
        ],
    )

    return app