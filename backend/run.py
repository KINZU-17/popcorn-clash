import os
from app import create_app

app = create_app()

@app.route("/")
def home():
    return "Welcome to the Popcorn Clash API!"

if __name__ == "__main__":
    # Note: init_db() and seed_database() are already executed 
    # inside app/__init__.py within app.app_context()
    port = int(os.environ.get("PORT", 5555))
    app.run(host="0.0.0.0", port=port, debug=True)