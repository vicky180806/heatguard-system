import os
import urllib.parse

from dotenv import load_dotenv

load_dotenv()

# Get password from environment variable or use default
raw_password = os.environ.get('DB_PASSWORD') or 'arun@2800'

# Encode password to handle special characters like '@'
password = urllib.parse.quote_plus(raw_password)

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    # Proper connection string using the encoded password
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f'mysql+mysqlconnector://root:{password}@localhost/heatshield'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
