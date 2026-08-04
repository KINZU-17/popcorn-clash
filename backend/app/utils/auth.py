from functools import wraps
from flask import request, jsonify, g
import secrets
from flask_bcrypt import Bcrypt

from app.database.queries import get_user_by_id, get_admin_user_count, get_banned_user_count
bcrypt = Bcrypt()
_active_tokens = {}


def create_token(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    _active_tokens[token] = user_id
    return token


def get_online_user_ids() -> set[int]:
    return set(_active_tokens.values())


def _current_user_id() -> int | None:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    return _active_tokens.get(token)


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = _current_user_id()
        if not user_id:
            return {"error": "Unauthorized"}, 401
        request.user_id = user_id
        return fn(*args, **kwargs)
    return wrapper


def super_admin_required(fn):
    @wraps(fn)
    @admin_required
    def wrapper(*args, **kwargs):
        if g.user.get('email') != 'admin@popcornclash@gmail.com':
            return {"error": "Forbidden: super admin access required"}, 403
        return fn(*args, **kwargs) # pragma: no cover
    return wrapper


def token_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = _current_user_id()
        if not user_id:
            return {"error": "Unauthorized"}, 401
        current_user = get_user_by_id(user_id)
        return fn(*args, current_user=current_user, **kwargs)
    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = _current_user_id()
        if not user_id:
            return {"error": "Unauthorized"}, 401
        user = get_user_by_id(user_id)
        if not user or user.get("role") != "admin":
            return {"error": "Forbidden: admin access required"}, 403
        request.user_id = user_id
        g.user = user
        return fn(*args, **kwargs)
    return wrapper
