from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.strava_token import StravaToken
import requests
import time
from app.config import STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET

def refresh_strava_token_if_needed(db: Session) -> str:
    """
    Vérifie si le token Strava est expiré et le rafraîchit si nécessaire.
    Retourne le token d'accès valide.
    """
    token_entry = db.query(StravaToken).order_by(StravaToken.id.desc()).first()
    
    if not token_entry:
        raise HTTPException(status_code=401, detail="Aucun token Strava trouvé. Veuillez vous reconnecter.")
    
    # Vérifier si le token est expiré (avec une marge de 5 minutes)
    current_time = int(time.time())
    if current_time >= token_entry.expires_at - 300:  # 5 minutes de marge
        # Token expiré, le rafraîchir
        try:
            response = requests.post("https://www.strava.com/oauth/token", data={
                "client_id": STRAVA_CLIENT_ID,
                "client_secret": STRAVA_CLIENT_SECRET,
                "grant_type": "refresh_token",
                "refresh_token": token_entry.refresh_token
            })
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Impossible de rafraîchir le token Strava. Veuillez vous reconnecter.")
            
            new_token_data = response.json()
            
            # Mettre à jour le token en base
            token_entry.access_token = new_token_data["access_token"]
            token_entry.refresh_token = new_token_data["refresh_token"]
            token_entry.expires_at = new_token_data["expires_at"]
            db.commit()
            
            return new_token_data["access_token"]
            
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Erreur lors du rafraîchissement du token: {str(e)}")
    
    return token_entry.access_token

def get_current_token(db: Session = Depends(get_db)) -> str:
    """
    Récupère le token d'accès Strava actuel, en le rafraîchissant si nécessaire.
    """
    return refresh_strava_token_if_needed(db)

def get_athlete_id_from_token(db: Session = Depends(get_db)) -> int:
    token_entry = db.query(StravaToken).order_by(StravaToken.id.desc()).first()
    if not token_entry or not token_entry.athlete_id:
        raise HTTPException(status_code=401, detail="No athlete ID found")
    return token_entry.athlete_id

def get_latest_athlete_id(db):
    token_entry = db.query(StravaToken).order_by(StravaToken.id.desc()).first()
    if token_entry and token_entry.athlete_id:
        return token_entry.athlete_id
    raise HTTPException(status_code=404, detail="Aucun athlete_id trouvé")