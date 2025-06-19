from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.strava import get_db
from app.models.strava_token import StravaToken

def get_current_token(db: Session = Depends(get_db)) -> str:
    token_entry = db.query(StravaToken).order_by(StravaToken.created_at.desc()).first()
    if not token_entry or not token_entry.access_token:
        raise HTTPException(status_code=401, detail="No valid Strava token found")
    return token_entry.access_token

def get_athlete_id_from_token(db: Session = Depends(get_db)) -> int:
    token_entry = db.query(StravaToken).order_by(StravaToken.created_at.desc()).first()
    if not token_entry or not token_entry.athlete_id:
        raise HTTPException(status_code=401, detail="No athlete ID found")
    return token_entry.athlete_id