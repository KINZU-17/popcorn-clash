from app.extensions import db


class PasswordReset(db.Model):
    __tablename__ = "password_resets"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(120), nullable=False)
    code = db.Column(db.String(10), nullable=False)
    expires_at = db.Column(db.String(255), nullable=False)
    used = db.Column(db.Integer, default=0)
    created_at = db.Column(db.String(255), default="CURRENT_TIMESTAMP")
