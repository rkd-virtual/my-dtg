# -----------------------------------------------------------
# Import all necessary Flask and extension libraries
# -----------------------------------------------------------
from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity,
    set_access_cookies, unset_jwt_cookies
)
from datetime import datetime, timezone, timedelta
from urllib.parse import quote
import os, json


# -----------------------------------------------------------
# Import app-specific modules for database and helpers
# -----------------------------------------------------------
from ..extensions import db
from ..models import User, UserProfile
from ..utils import make_verify_token, load_verify_token, send_mail, generate_reset_code


# -----------------------------------------------------------
# Initialize a Blueprint for authentication-related routes
# -----------------------------------------------------------
auth_bp    = Blueprint("auth", __name__)
profile_bp = Blueprint("profile", __name__)

# -----------------------------------------------------------------------------
# SIGNUP — creates a new user, saves to DB, and sends email verification link
# -----------------------------------------------------------------------------
@auth_bp.post("/signup")
def signup():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "")

    if not email or not password:
        return jsonify(message="Email and password are required"), 400
    if len(password) < 8:
        return jsonify(message="Password must be at least 8 characters"), 400

    if User.query.filter_by(email=email).first():
        return jsonify(message="Email already registered"), 409

    user = User(email=email, is_verified=False)
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    db.session.add(UserProfile(user_id=user.id))
    db.session.commit()

    token = make_verify_token(user.id)
    frontend = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
    verify_link = f"{frontend}/setup-profile?member={quote(token, safe='')}"

    # inside your signup() or resend_verification() after you compute `verify_link`
    html = f"""\
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Verify your email</title>
        <meta name="viewport" content="width=device-width,initial-scale=1">
    </head>
    <body style="margin:0;padding:0;background:#f5f5f5;">
        <!-- preheader (hidden preview text) -->
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        Please verify your email address to finish creating your account.
        </div>

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f5f5;">
        <tr>
            <td align="center" style="padding:24px;">
            <!-- card -->
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:8px;">
                <tr>
                <td style="padding:28px 28px 8px 28px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
                    <p style="margin:0 0 16px 0;font-size:16px;line-height:24px;">
                    Thank you for creating an account! To finish signing up, please verify your email address.
                    </p>
                    <p style="margin:0 0 20px 0;font-size:16px;line-height:24px;">
                    To confirm your email, please click this link:
                    </p>
                </td>
                </tr>

                <!-- button (bulletproof table) -->
                <tr>
                <td align="center" style="padding:0 28px 24px 28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:544px;">
                    <tr>
                        <td align="center" bgcolor="#1f2937" style="border-radius:8px;">
                        <a href="{verify_link}"
                            style="display:block;padding:14px 18px;font-family:Arial,Helvetica,sans-serif;
                                    font-size:16px;line-height:24px;color:#ffffff;text-decoration:none;
                                    font-weight:600;border-radius:8px;background:#1f2937;">
                            Verify Email
                        </a>
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>

                <!-- footer copy -->
                <tr>
                <td style="padding:4px 28px 28px 28px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
                    <p style="margin:0 0 8px 0;font-size:14px;line-height:22px;">
                    Welcome and thank you!
                    </p>
                    <p style="margin:12px 0 0 0;font-size:12px;line-height:18px;color:#6b7280;">
                    If the button doesn’t work, copy and paste this URL into your browser:<br>
                    <span style="word-break:break-all;color:#374151;">{verify_link}</span>
                    </p>
                </td>
                </tr>
            </table>
            <!-- /card -->
            </td>
        </tr>
        </table>
    </body>
    </html>
    """

    # Send the actual email to the user
    send_mail(user.email, "Verify your DTG Portal account", html)
    return jsonify(message="Verification email sent"), 201

# ---------------------------------------------------------------------------
# RESEND VERIFICATION — re-sends verification email if user not yet verified
# ---------------------------------------------------------------------------
@auth_bp.post("/resend-verification")
def resend_verification():
    data    = request.get_json(silent=True) or {}
    email   = (data.get("email") or "").strip().lower()
    user    = User.query.filter_by(email=email).first()
    if not user or user.is_verified:
        # Always return success to prevent user enumeration
        return jsonify(message="If the email exists, a new link was sent"), 200

    # Create new token and resend verification email
    token       = make_verify_token(user.id)
    frontend    = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
    verify_link = f"{frontend}/setup-profile?member={quote(token, safe='')}"
    
    html = f"""\
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Verify your email</title>
        <meta name="viewport" content="width=device-width,initial-scale=1">
    </head>
    <body style="margin:0;padding:0;background:#f5f5f5;">
        <!-- preheader (hidden preview text) -->
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        Please verify your email address to finish creating your account.
        </div>

        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f5f5;">
        <tr>
            <td align="center" style="padding:24px;">
            <!-- card -->
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:8px;">
                <tr>
                <td style="padding:28px 28px 8px 28px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
                    <p style="margin:0 0 16px 0;font-size:16px;line-height:24px;">
                    Thank you for creating an account! To finish signing up, please verify your email address.
                    </p>
                    <p style="margin:0 0 20px 0;font-size:16px;line-height:24px;">
                    To confirm your email, please click this link:
                    </p>
                </td>
                </tr>

                <!-- button (bulletproof table) -->
                <tr>
                <td align="center" style="padding:0 28px 24px 28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:544px;">
                    <tr>
                        <td align="center" bgcolor="#1f2937" style="border-radius:8px;">
                        <a href="{verify_link}"
                            style="display:block;padding:14px 18px;font-family:Arial,Helvetica,sans-serif;
                                    font-size:16px;line-height:24px;color:#ffffff;text-decoration:none;
                                    font-weight:600;border-radius:8px;background:#1f2937;">
                            Verify Email
                        </a>
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>

                <!-- footer copy -->
                <tr>
                <td style="padding:4px 28px 28px 28px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
                    <p style="margin:0 0 8px 0;font-size:14px;line-height:22px;">
                    Welcome and thank you!
                    </p>
                    <p style="margin:12px 0 0 0;font-size:12px;line-height:18px;color:#6b7280;">
                    If the button doesn’t work, copy and paste this URL into your browser:<br>
                    <span style="word-break:break-all;color:#374151;">{verify_link}</span>
                    </p>
                </td>
                </tr>
            </table>
            <!-- /card -->
            </td>
        </tr>
        </table>
    </body>
    </html>
    """
    send_mail(user.email, "Your verification link", html)
    return jsonify(message="Verification email resent"), 200

# -----------------------------------------------------------------
# VERIFY EMAIL — validates the token user clicked from their email
# -----------------------------------------------------------------
@auth_bp.post("/verify-email")
def verify_email():
    data = request.get_json(silent=True) or {}
    token = (data.get("token") or "").strip()

    # Decode and validate token
    try:
        payload = load_verify_token(token)
        uid = int(payload["uid"])
    except Exception:
        return jsonify(message="Invalid or expired verification link"), 400

    user = User.query.get(uid)
    if not user:
        return jsonify(message="User not found"), 404

    # Mark email as verified if not done already
    if not user.is_verified:
        user.is_verified = True
        user.email_verified_at = datetime.now(timezone.utc)
        db.session.commit()

    # Return raw JSON to avoid any response transformers trimming fields
    payload = {"message": "Email verified", "email": user.email, "setup_token": token}
    resp = make_response(json.dumps(payload), 200)
    resp.headers["Content-Type"] = "application/json"
    return resp

# -----------------------------------------------------------
# SETUP PROFILE — completes the user profile after verification
# -----------------------------------------------------------
@auth_bp.put("/setup-profile")
def setup_profile():
    data = request.get_json(silent=True) or {}
    token = data.get("token") or ""

    # Verify token and get user id
    try:
        payload = load_verify_token(token)
        uid = int(payload["uid"])
    except Exception:
        return jsonify(message="Invalid or expired link"), 400

    user = User.query.get(uid)
    if not user:
        return jsonify(message="User not found"), 404
    if not user.is_verified:
        return jsonify(message="Please verify your email first"), 403

    # Load or create the profile record
    profile = UserProfile.query.filter_by(user_id=uid).first() or UserProfile(user_id=uid)

    # Helper to sanitize string fields
    def s(v, n=255):
        if v is None: return None
        v = str(v).strip()
        return v[:n]

    # Helper to convert comma-separated string → list of strings
    def listify(v):
        if v is None: return []
        if isinstance(v, list):
            return [s(x) for x in v if s(x)]
        return [s(x) for x in str(v).split(",") if s(x)]

    # Save all profile fields
    profile.first_name      = s(data.get("first_name"))
    profile.last_name       = s(data.get("last_name"))
    profile.job_title       = s(data.get("job_title"))
    profile.amazon_site     = s(data.get("amazon_site"))
    profile.other_accounts  = listify(data.get("other_accounts"))

    db.session.add(profile)
    user.profile_completed_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(message="Profile saved. Please log in."), 200

# --------------------------------------------------------------
# LOGIN — authenticates user and issues JWT (also sets cookie)
# --------------------------------------------------------------
@auth_bp.post("/login")
def login():
    data     = request.get_json(silent=True) or {}
    email    = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "")

    # 1) Basic validation
    if not email or not password:
        return jsonify(message="Email and password are required"), 400

    # 2) Look up user by email
    user = User.query.filter_by(email=email).first()
    if not user:
        # No user with that email
        return jsonify(message="No account found. Please sign up first."), 404

    # 3) Verify password
    if not user.check_password(password):
        return jsonify(message="The provided credentials are invalid."), 401

    # 4) Verify email confirmation
    if not user.is_verified:
        return jsonify(message="Please verify your email to continue"), 403

    # Create and send JWT token + cookie
    token = create_access_token(identity=str(user.id))
    resp  = jsonify(token=token)
    set_access_cookies(resp, token)
    return resp, 200

# ----------------------------------------------
# MEMBER CHECK — authenticates exsisting user 
# ----------------------------------------------
@auth_bp.post("/check-member")
def check_member():
    """
    POST /api/auth/check-member
    Body: { email: "<email>", token: "<optional-setup-token>" }

    Returns 200 with JSON:
      { exists: bool, allowed: bool, message: str }
    """
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    token = (data.get("token") or "").strip()

    if not email:
        return jsonify(message="Email is required"), 400

    try:
        user = User.query.filter_by(email=email).first()
    except Exception as e:
        # DB failure
        return jsonify(message=f"DB error: {str(e)}"), 500

    if not user:
        return jsonify({
            "exists": False,
            "allowed": False,
            "message": "This email isn’t registered. Please sign up first."
        }), 200

    # If a token is supplied, validate it's for the same user
    if token:
        try:
            payload = load_verify_token(token)
            uid_from_token = int(payload.get("uid"))
            if user.id != uid_from_token:
                return jsonify({
                    "exists": True,
                    "allowed": False,
                    "message": "The verification link does not match this email."
                }), 200
        except Exception:
            return jsonify({
                "exists": True,
                "allowed": False,
                "message": "Invalid or expired verification token."
            }), 200

    # If profile already completed
    """ if getattr(user, "profile_completed_at", None):
        return jsonify({
            "exists": True,
            "allowed": False,
            "message": "Profile already completed. Please log in."
        }), 200 """

    # Determine reference timestamp for 30-day window:
    ts = None
    if getattr(user, "email_verified_at", None):
        ts = user.email_verified_at
    elif getattr(user, "created_at", None):
        ts = user.created_at

    if ts is None:
        # No timestamps available: allow by default (or change to deny)
        return jsonify({"exists": True, "allowed": True, "message": "OK"}), 200

    # Ensure ts is datetime and timezone-aware if possible
    if isinstance(ts, datetime):
        now = datetime.now(timezone.utc)
        # If ts is naive, treat it as UTC:
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        age = now - ts
    else:
        age = timedelta(days=9999)

    if age <= timedelta(days=30):
        return jsonify({"exists": True, "allowed": True, "message": "OK"}), 200

    # Expired
    return jsonify({
        "exists": True,
        "allowed": False,
        "message": "This verification link has expired (over 30 days). Please request a new verification email."
    }), 200

# -----------------
# FORGOT PASSWORD 
# -----------------
@auth_bp.post("/forgot-password")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        # Generic response to avoid enumeration
        return jsonify(message="If the email exists, a reset code has been sent."), 200

    user = User.query.filter_by(email=email).first()
    if not user:
        # Always return the same message to avoid leaking which emails exist
        return jsonify(message="If the email exists, a reset code has been sent."), 200

    # generate a plain numeric code (6 digits)
    raw_code = generate_reset_code(6)  # should return e.g. "023491"

    # save plain code (you asked for normal digit) and expiry (30 minutes)
    user.password_reset_code = raw_code
    user.password_reset_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
    db.session.add(user)
    db.session.commit()

    # Email the code. Keep content simple and prominent.
    html = f"""
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px">
        <h2>DTG Portal — password reset code</h2>
        <p style="font-size:28px;font-weight:700;margin:18px 0;">{raw_code}</p>
        <p>This code is valid for 30 minutes. Enter the code in the portal to reset your password.</p>
        <p>If you didn't request this, you can ignore this email.</p>
      </div>
    """
    try:
        send_mail(user.email, "DTG Portal — password reset code", html)
    except Exception as e:
        # Log but still return generic response
        print("send_mail failed:", str(e), flush=True)

    return jsonify(message="If the email exists, a reset code has been sent."), 200

# -----------------------------------------------------------
# RESET PASSWORD — verify code & set new password
# -----------------------------------------------------------
@auth_bp.post("/reset-password")
def reset_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    code = (data.get("code") or "").strip()
    new_password = data.get("new_password") or ""

    if not email or not code or not new_password:
        return jsonify(message="Email, code and new password are required"), 400
    if len(new_password) < 8:
        return jsonify(message="Password must be at least 8 characters"), 400
    # optional: ensure code is digits-only and length 6
    if not code.isdigit() or len(code) != 6:
        return jsonify(message="Invalid reset code format"), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        # keep message generic
        return jsonify(message="Invalid code or email"), 400

    # ensure a code exists for user
    if not user.password_reset_code or not user.password_reset_expires_at:
        return jsonify(message="Invalid reset code"), 400

    # check expiry
    now = datetime.now(timezone.utc)
    if user.password_reset_expires_at < now:
        # clear expired values
        user.password_reset_code = None
        user.password_reset_expires_at = None
        db.session.add(user)
        db.session.commit()
        return jsonify(message="Reset code expired"), 400

    # compare codes
    if user.password_reset_code != code:
        return jsonify(message="Invalid reset code"), 400

    # success: update password and clear reset fields
    user.set_password(new_password)
    user.password_reset_code = None
    user.password_reset_expires_at = None
    db.session.add(user)
    db.session.commit()

    return jsonify(message="Password reset successful. Please log in."), 200


# -----------------------------------------------------------
# LOGOUT — removes JWT cookies from browser (ends session)
# -----------------------------------------------------------
@auth_bp.post("/session/logout")
def session_logout():
    resp = jsonify(message="Logged out")
    unset_jwt_cookies(resp)
    return resp

# -----------------------------------------------------------
# ME — returns the logged-in user's basic info (JWT protected)
# -----------------------------------------------------------
@auth_bp.get("/me")
@jwt_required()
def me():
    ident = get_jwt_identity()
    try:
        user_id = int(ident)
    except (TypeError, ValueError):
        # fallback if token is bad — force a logout from frontend if this happens
        return jsonify(message="Invalid token identity"), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify(message="User not found"), 404

    return jsonify(id=user.id, email=user.email, is_verified=user.is_verified)

# -----------------------------------------------------------
# Profile -  Detailed informations (JWT protected)
# -----------------------------------------------------------
@auth_bp.get("/profile")
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify(message="User not found"), 404

    profile = user.profile  # since you already defined `user.profile` relationship
    if not profile:
        return jsonify(message="Profile not found"), 404

    return jsonify({
        "id": user.id,
        "email": user.email,
        "first_name": profile.first_name,
        "last_name": profile.last_name,
        "job_title": profile.job_title,
        "amazon_site": profile.amazon_site,
        "other_accounts": profile.other_accounts,
    })
