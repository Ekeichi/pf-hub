"""
Configuration de l'application.
Gère les variables d'environnement pour :
- Les clés API Strava
- Les paramètres de base de données
- Les configurations de sécurité
- Les paramètres d'application
"""

import os
import secrets

# STRAVA_CLIENT_ID = os.environ.get("STRAVA_CLIENT_ID")
# STRAVA_CLIENT_SECRET = os.environ.get("STRAVA_CLIENT_SECRET")

STRAVA_CLIENT_ID = "141778"
STRAVA_CLIENT_SECRET = "a334c280c5e9cd771d1a4659b58ce9e2cfe183f4"
REDIRECT_URI = "http://localhost:8000/api/strava/callback"

# Configuration JWT et sécurité
SECRET_KEY = os.environ.get("SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 minutes par défaut

# Configuration de l'application
APP_NAME = "PeakFlow Kairos Zero"
APP_VERSION = "1.0.0" 