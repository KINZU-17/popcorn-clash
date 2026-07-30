import sqlite3
import os
from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool

DB_PATH = os.environ.get("POPCORNCLASH_DB_PATH", os.path.join(os.path.dirname(__file__), "popcornclash.db"))
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{DB_PATH}")


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


@contextmanager
def get_cursor() -> Generator[sqlite3.Cursor, None, None]:
    conn = get_connection()
    try:
        yield conn.cursor()
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def _read_sql_file(filename: str) -> str:
    sql_path = os.path.join(os.path.dirname(__file__), filename)
    with open(sql_path, "r", encoding="utf-8") as f:
        return f.read()


def get_engine():
    return create_engine(DATABASE_URL, poolclass=NullPool, future=True)


def init_db() -> None:
    if DATABASE_URL.startswith("postgresql"):
        engine = get_engine()
        with engine.begin() as conn:
            ddl = text(_read_sql_file("schema.sql"))
            conn.execute(ddl)
    else:
        with get_connection() as conn:
            conn.executescript(_read_sql_file("schema.sql"))


def seed_database() -> None:
    if DATABASE_URL.startswith("postgresql"):
        engine = get_engine()
        with engine.begin() as conn:
            dml = text(_read_sql_file("seed.sql"))
            conn.execute(dml)
    else:
        with get_connection() as conn:
            conn.executescript(_read_sql_file("seed.sql"))
