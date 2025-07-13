from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.strava_token import StravaToken
from app.models.user import User
from app.dependencies.auth import get_current_user
import requests
import time
from app.config import STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET

def refresh_strava_token_if_needed(db: Session, user_id: int) -> str:
    """
    Vérifie si le token Strava est expiré et le rafraîchit si nécessaire.
    Retourne le token d'accès valide pour l'utilisateur spécifié.
    """
    token_entry = db.query(StravaToken).filter_by(user_id=user_id).first()
    
    if not token_entry:
        raise HTTPException(status_code=401, detail="Aucun token Strava trouvé pour cet utilisateur. Veuillez vous reconnecter.")
    
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

def get_current_token(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> str:
    """
    Récupère le token d'accès Strava actuel pour l'utilisateur connecté, en le rafraîchissant si nécessaire.
    """
    return refresh_strava_token_if_needed(db, current_user.id)

def get_athlete_id_from_token(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> int:
    """
    Récupère l'athlete_id Strava de l'utilisateur connecté.
    """
    token_entry = db.query(StravaToken).filter_by(user_id=current_user.id).first()
    if not token_entry or not token_entry.athlete_id:
        raise HTTPException(status_code=401, detail="Aucun compte Strava lié trouvé pour cet utilisateur")
    return token_entry.athlete_id

def get_latest_athlete_id(db):
    token_entry = db.query(StravaToken).order_by(StravaToken.id.desc()).first()
    if token_entry and token_entry.athlete_id:
        return token_entry.athlete_id
    raise HTTPException(status_code=404, detail="Aucun athlete_id trouvé")