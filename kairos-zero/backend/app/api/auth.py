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
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from app.security import create_access_token
from app.models import User
from app.config import settings
from app.dependencies.auth import get_current_user

router = APIRouter()

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

@router.post("/auth/refresh")
def refresh_token(current_user: User = Depends(get_current_user)):
    """
    Renouvelle le token JWT de l'utilisateur connecté.
    """
    try:
        # Créer un nouveau token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(current_user.id)},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du renouvellement du token: {str(e)}")
