from flask import Flask, jsonify
from .config import Config
from .extensions import db, migrate, jwt, cors
from .routes.auth import auth_bp
from .routes.settings import settings_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config())

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", [])}}, supports_credentials=True)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(settings_bp, url_prefix="/api")

    @app.get("/")
    def index():
        # simple JSON welcome; change to redirect if you prefer
        return jsonify(service="DTG API", docs="/api/health")

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    return app
