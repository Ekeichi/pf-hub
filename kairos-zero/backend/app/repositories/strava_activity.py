from sqlalchemy.orm import Session
from app.models.strava_activity import StravaActivity
from typing import List, Dict
from datetime import datetime
import requests
import json

def save_activities(db: Session, athlete_id: int, activities: List[Dict]):
    for act in activities:
        # Vérifie si l'activité existe déjà en base
        existing = db.query(StravaActivity).filter_by(activity_id=act["activity_data"]["id"]).first()
        if existing:
            continue

        activity = act["activity_data"]
        streams = act.get("streams", {})
        best_efforts = act.get("best_efforts", [])

        # Récupération sécurisée des données de streams
        distance_data = streams.get("distance", {}).get("data", [])
        time_data = streams.get("time", {}).get("data", [])
        velocity_data = streams.get("velocity_smooth", {}).get("data", [])
        altitude_data = streams.get("altitude", {}).get("data", [])
        heartrate_data = streams.get("heartrate", {}).get("data", [])
        watts_data = streams.get("watts", {}).get("data", [])
        cadence_data = streams.get("cadence", {}).get("data", [])
        segments_data = streams.get("segments", {}).get("data", [])

        # Sérialisation JSON conditionnelle
        elevation_data = json.dumps({
            "distance": [d / 1000 for d in distance_data],
            "altitude": altitude_data
        }) if distance_data or altitude_data else None

        pace_data = json.dumps({
            "time": time_data,
            "distance": [d / 1000 for d in distance_data],
            "velocity": [round(v * 3.6, 2) if v is not None else None for v in velocity_data]
        }) if time_data or distance_data or velocity_data else None

        heartrate_json = json.dumps({
            "time": time_data,
            "heartrate": heartrate_data
        }) if time_data or heartrate_data else None

        power_data = json.dumps({
            "watts": watts_data,
            "cadence": cadence_data,
            "time": time_data
        }) if watts_data or cadence_data else None

        segments_json = json.dumps(segments_data) if segments_data else None

        # Création de l'instance StravaActivity à insérer
        new_act = StravaActivity(
            athlete_id=athlete_id,
            activity_id=activity["id"],
            name=activity.get("name"),
            type=activity.get("type"),
            start_date=datetime.fromisoformat(activity["start_date"].replace("Z", "+00:00")),
            distance=activity.get("distance"),
            moving_time=activity.get("moving_time"),
            elapsed_time=activity.get("elapsed_time"),
            total_elevation_gain=activity.get("total_elevation_gain"),
            average_speed=activity.get("average_speed"),
            max_speed=activity.get("max_speed"),
            average_heartrate=activity.get("average_heartrate"),
            max_heartrate=activity.get("max_heartrate"),
            calories=activity.get("calories"),
            elevation_data=elevation_data,
            pace_data=pace_data,
            heartrate_data=heartrate_json,
            segments=segments_json,
            power_data=power_data,
            best_efforts=json.dumps(best_efforts)
        )

        db.add(new_act)

    db.commit()


def get_activities_for_prediction(db: Session, athlete_id: int):
    """
    Récupère toutes les activités avec données JSON nécessaires à l'entraînement du modèle pente-vitesse.
    """
    return db.query(StravaActivity).filter(
        StravaActivity.athlete_id == athlete_id,
        StravaActivity.elevation_data.isnot(None),
        StravaActivity.pace_data.isnot(None),
        StravaActivity.heartrate_data.isnot(None)
    ).all()


def fetch_full_activity_details(access_token: str, activity_id: int) -> dict:
    """
    Récupère les infos détaillées + best_efforts + streams d'une activité Strava via l'API.

    Args:
        access_token (str): Token d'accès OAuth Strava.
        activity_id (int): ID de l'activité.

    Returns:
        dict: Dictionnaire contenant "activity_data", "streams", et "best_efforts".
    """
    headers = {"Authorization": f"Bearer {access_token}"}

    # 1. Détails activité
    detailed_url = f"https://www.strava.com/api/v3/activities/{activity_id}"
    resp_detail = requests.get(detailed_url, headers=headers)
    if resp_detail.status_code != 200:
        return {}

    data = resp_detail.json()

    # 2. Streams (types demandés adaptés à Strava API)
    types = [
        "distance", "time", "velocity_smooth", "altitude", "heartrate",
        "watts", "cadence", "segments"
    ]
    stream_url = f"https://www.strava.com/api/v3/activities/{activity_id}/streams"
    resp_stream = requests.get(
        stream_url,
        headers=headers,
        params={"keys": ",".join(types), "key_by_type": True}
    )
    streams = resp_stream.json() if resp_stream.status_code == 200 else {}

    return {
        "activity_data": data,
        "streams": streams,
        "best_efforts": data.get("best_efforts", [])
    }