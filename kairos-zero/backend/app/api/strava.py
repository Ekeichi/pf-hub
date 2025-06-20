from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import STRAVA_CLIENT_ID, REDIRECT_URI
from app.services.strava_service import StravaService
from app.repositories.strava_token import upsert_strava_token
from app.models.strava_token import StravaToken
from app.repositories.strava_activity import save_activities, fetch_full_activity_details
from app.utils.strava_auth import get_current_token, get_athlete_id_from_token
import requests

router = APIRouter()
service = StravaService()

@router.get("/strava/auth")
def auth():
    url = (
        "https://www.strava.com/oauth/authorize"
        f"?client_id={STRAVA_CLIENT_ID}"
        f"&response_type=code"
        f"&redirect_uri={REDIRECT_URI}"
        f"&scope=read,activity:read_all"
        f"&approval_prompt=auto"
    )
    return RedirectResponse(url)

@router.get("/strava/callback")
def callback(code: str, db: Session = Depends(get_db)):
    data = service.exchange_code(code)

    upsert_strava_token(
        db,
        athlete_id=data["athlete"]["id"],
        access_token=data["access_token"],
        refresh_token=data["refresh_token"],
        expires_at=data["expires_at"]
    )

    # Redirige vers le frontend après succès
    return RedirectResponse("http://localhost:5173/strava-success")

@router.get("/strava/activities")
def get_activities(db: Session = Depends(get_db), token: str = Depends(get_current_token)):
    athlete_id = get_athlete_id_from_token(db)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Récupération des activités (liste de base)
    url = "https://www.strava.com/api/v3/athlete/activities"
    resp = requests.get(url, headers=headers, params={"per_page": 50})
    base_activities = resp.json()

    detailed_activities = []
    for act in base_activities:
        activity_id = act["id"]
        full_data = fetch_full_activity_details(token, activity_id)
        if full_data:
            detailed_activities.append(full_data)

    save_activities(db, athlete_id, detailed_activities)

    return {"status": "OK", "saved": len(detailed_activities)}
