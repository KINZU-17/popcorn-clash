import os
from pathlib import Path
from dotenv import load_dotenv

# Ensure environment variables are loaded BEFORE blueprints/utils import
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from flask import Flask, jsonify, request, g
from flask_cors import CORS
from flask_migrate import Migrate
from app.extensions import db
from app. import models # Import models to register them with SQLAlchemy
from app.utils.auth import _current_user_id
from app.routes.auth import _hash_password
from app.utils.logger import logger


def create_app():
    app = Flask(__name__)
    app.config.from_object("config.config")
    CORS(app)

    db.init_app(app)
    Migrate(app, db)

    @app.before_request
    def load_logged_in_user():
        user_id = _current_user_id()
        if user_id is None:
            g.user = None
        else:
            from app.database.queries import get_user_by_id
            g.user = get_user_by_id(user_id)

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
        # Seed the super admin user if it doesn't exist
        from app.database.queries import get_user_by_email, create_user, update_user_role
        admin_email = "admin@popcornclash@gmail.com"
        admin_password = "password123"

        if not get_user_by_email(admin_email):
            logger.info("seeding.admin.create", email=admin_email)
            password_hash = _hash_password(admin_password)
            user_id = create_user(
                username="superadmin",
                email=admin_email,
                password_hash=password_hash,
                favorite_club="PopcornClash FC"
            )
            update_user_role(user_id, "admin")

    # Import blueprints after env vars are loaded
    from app.routes.auth import auth_bp
    from app.routes.admin import admin_bp
    from app.routes.teams import teams_bp
    from app.routes.fixtures import fixtures_bp
    from app.routes.predictions import predictions_bp
    from app.routes.users import users_bp
    from app.routes.movies import movies_bp
    from app.routes.reviews import reviews_bp
    from app.routes.history import history_bp

    app.register_blueprint(admin_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(teams_bp)
    app.register_blueprint(fixtures_bp)
    app.register_blueprint(predictions_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(movies_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(history_bp)

    logger.info(
        "Application initialized",
        routes=[
            "auth",
            "admin",
            "teams",
            "fixtures",
            "predictions",
            "users",
            "movies",
            "reviews",
        ],
    )

    return app