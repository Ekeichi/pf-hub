from sqlalchemy.orm import Session
from app.models.strava_token import StravaToken

def upsert_strava_token(db: Session, athlete_id: int, access_token: str, refresh_token: str, expires_at: int):
    token = db.query(StravaToken).filter_by(athlete_id=athlete_id).first()
    if token:
        token.access_token = access_token
        token.refresh_token = refresh_token
        token.expires_at = expires_at
    else:
        token = StravaToken(
            athlete_id=athlete_id,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=expires_at
        )
        db.add(token)
    db.commit()
    db.refresh(token)
    return token