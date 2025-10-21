# --------------------------------------------------------------
# Standard libs and helpers for timestamps and password hashing
# --------------------------------------------------------------
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash

# -----------------------------------------------------------
# SQLAlchemy base (db) provided by your app's extensions
# -----------------------------------------------------------
from .extensions import db

# -----------------------------------------------------------
# Postgres-specific column type for text arrays (ARRAY)
# For other db like MYSQL/SQlite 
# [from sqlalchemy import JSON]
# other_accounts = db.Column(JSON, nullable=False, server_default="[]")
# -----------------------------------------------------------
from sqlalchemy.dialects.postgresql import ARRAY


# -------------------------------------------------------------------
# User: stores login credentials and verification status
# @email : Unique, indexed email used for login
# @password_hash : Hashed password (never store raw passwords)
# Timestamps (UTC now by default; updated_at auto-updates on change)
# -------------------------------------------------------------------
class User(db.Model):
    __tablename__ = "users"
    id                   = db.Column(db.Integer, primary_key=True)
    email                = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash        = db.Column(db.String(255), nullable=False)
    is_verified          = db.Column(db.Boolean, nullable=False, server_default="false")
    email_verified_at    = db.Column(db.DateTime)
    profile_completed_at = db.Column(db.DateTime)
    created_at           = db.Column(
                                db.DateTime, 
                                default=lambda: datetime.now(timezone.utc), 
                                nullable=False
                            )
    updated_at           = db.Column(
                                db.DateTime, 
                                default=lambda: datetime.now(timezone.utc), 
                                onupdate=lambda: datetime.now(timezone.utc)
                            )

    # 1:1 relationship to profile (cascade ensures profile is deleted with user)
    profile = db.relationship(
                    "UserProfile", 
                    back_populates="user", 
                    uselist=False, 
                    cascade="all, delete-orphan"
                )
    
    # Helper to hash and set the user's password
    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    # Helper to validate a raw password against the stored hash
    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

# -------------------------------------------------------------------------
# UserProfile: stores extended profile fields for a user (1:1)
# @user_id   : Link to users.id (unique=True enforces one profile per user)
# -------------------------------------------------------------------------
class UserProfile(db.Model):
    __tablename__ = "user_profiles"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)

    # NEW FIELDS
    first_name   = db.Column(db.String(255))
    last_name    = db.Column(db.String(255))
    job_title    = db.Column(db.String(255))
    amazon_site  = db.Column(db.String(255))

    # Postgres text[] column to store multiple other account IDs/usernames
    # server_default="{}" initializes as an empty array at DB level
    other_accounts = db.Column(ARRAY(db.String), server_default="{}", nullable=False)

    # Back-reference to User (completes the 1:1 link)
    user = db.relationship("User", back_populates="profile")
