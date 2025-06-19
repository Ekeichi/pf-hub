"""
Gestion de l'authentification OAuth avec Strava.
Contient les routes pour :
- L'initiation du flux OAuth
- Le callback OAuth
- La gestion des tokens d'accès
- La déconnexion
"""

import requests
from app.config import STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET


def refresh_strava_token(refresh_token: str) -> dict:
    """
    Rafraîchit un access_token Strava à partir d'un refresh_token.
    Retourne le nouveau token (dict avec access_token, refresh_token, expires_at, etc.)
    """
    url = "https://www.strava.com/oauth/token"
    data = {
        "client_id": STRAVA_CLIENT_ID,
        "client_secret": STRAVA_CLIENT_SECRET,
        "grant_type": "refresh_token",
        "refresh_token": refresh_token
    }
    response = requests.post(url, data=data)
    response.raise_for_status()
    return response.json()
