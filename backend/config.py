import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
    DATABASE_PATH = os.environ.get("POPCORNCLASH_DB_PATH", str(Path(__file__).parent / "popcornclash.db"))
    DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{DATABASE_PATH}")
    BACKEND_URL = os.environ.get("VITE_BACKEND_URL", "http://localhost:5000")
    TMDB_API_KEY = os.environ.get("TMDB_API_KEY", "")
    TMDB_BASE_URL = "https://api.themoviedb.org/3"
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False


config = Config()
