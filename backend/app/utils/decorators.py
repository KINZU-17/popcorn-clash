from functools import wraps
import time
from flask import request, jsonify


def rate_limit(limit: int, per: int):
    """
    A rate-limiting decorator that uses an in-memory store.

    :param limit: The number of allowed requests.
    :param per: The time window in seconds.
    """
    # In-memory store: {ip: [timestamp1, timestamp2, ...]}
    _requests = {}

    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            ip_address = request.remote_addr
            current_time = time.time()

            if ip_address not in _requests:
                _requests[ip_address] = []

            # Filter out requests older than the window
            _requests[ip_address] = [t for t in _requests[ip_address] if current_time - t < per]

            if len(_requests[ip_address]) >= limit:
                return jsonify({"error": f"Too many requests. Limit is {limit} per {per} seconds."}), 429

            _requests[ip_address].append(current_time)
            return f(*args, **kwargs)
        return wrapped
    return decorator