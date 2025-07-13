"""
Service d'intégration avec l'API Strava.
Gère :
- L'authentification OAuth
- La récupération des activités
- La synchronisation des données
- La gestion des tokens d'accès
"""

import requests
from app.config import STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET

class StravaService:
    BASE_URL = "https://www.strava.com/api/v3"

    def exchange_code(self, code: str) -> dict:
        response = requests.post("https://www.strava.com/oauth/token", data={
            "client_id": STRAVA_CLIENT_ID,
            "client_secret": STRAVA_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code"
        })
        response.raise_for_status()
        return response.json()

    def refresh_token(self, refresh_token: str) -> dict:
        response = requests.post("https://www.strava.com/oauth/token", data={
            "client_id": STRAVA_CLIENT_ID,
            "client_secret": STRAVA_CLIENT_SECRET,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token
        })
        response.raise_for_status()
        return response.json()

    def get_activities(self, access_token: str, per_page=30, page=1):
        response = requests.get(
            f"{self.BASE_URL}/athlete/activities",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"per_page": per_page, "page": page}
        )
        response.raise_for_status()
        return response.json()