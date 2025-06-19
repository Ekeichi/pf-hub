"""
Configuration de l'application.
Gère les variables d'environnement pour :
- Les clés API Strava
- Les paramètres de base de données
- Les configurations de sécurité
- Les paramètres d'application
"""

import os

# STRAVA_CLIENT_ID = os.environ.get("STRAVA_CLIENT_ID")
# STRAVA_CLIENT_SECRET = os.environ.get("STRAVA_CLIENT_SECRET")

STRAVA_CLIENT_ID = "141778"
STRAVA_CLIENT_SECRET = "a334c280c5e9cd771d1a4659b58ce9e2cfe183f4"
REDIRECT_URI = "http://localhost:8000/api/strava/callback" 