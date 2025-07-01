from sqlalchemy import Column, Integer, String, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
import requests


class StravaToken(Base):
    __tablename__ = "strava_tokens"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(BigInteger, unique=True, index=True)
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=False)
    expires_at = Column(BigInteger, nullable=False)
    
    # Relation avec l'utilisateur
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable pour migration
    user = relationship("User", back_populates="strava_token")


def get_athlete_id_from_token(access_token: str) -> int:
    """
    Appelle l'endpoint /athlete pour récupérer l'ID de l'athlète à partir du token d'accès.
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    resp = requests.get("https://www.strava.com/api/v3/athlete", headers=headers)
    if resp.status_code == 200:
        return resp.json().get("id")
    else:
        raise Exception("Impossible de récupérer l'athlete_id depuis le token")