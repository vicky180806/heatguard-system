from flask import Flask
from config import Config
from extensions import db, jwt, cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    # Allow CORS for frontend URL (adjust as needed in production)
    cors.init_app(app, resources={r"/*": {"origins": "*"}})

    # Register Blueprints
    from routes.auth import auth_bp
    from routes.heatmap import heatmap_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(heatmap_bp, url_prefix='/api/heatmap')
    
    from routes.profile import profile_bp
    app.register_blueprint(profile_bp, url_prefix='/api/profile')

    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
