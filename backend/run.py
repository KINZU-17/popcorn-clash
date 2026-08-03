from flask import Flask
from flask_cors import CORS  # 1. Import CORS

def create_app():
    app = Flask(__name__)
    
    # 2. Initialize CORS and allow your Vercel URL
    CORS(app, origins=[ # Best practice to not have a trailing slash
        "https://popcorn-clash-neon.vercel.app",
        "http://localhost:5173" # Optional: keeps local development working
    ])
    
    return app
