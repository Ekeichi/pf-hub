from sqlalchemy.orm import Session
from app.models.strava_activity import StravaActivity
from typing import List, Dict
from datetime import datetime
import requests
import json
from app.utils.heart_rate_zones import calculate_heart_rate_zones, calculate_effort_score

def save_activities(db: Session, athlete_id: int, activities: List[Dict]):
    """
    Sauvegarde intelligente des activités Strava avec gestion des mises à jour.
    - Vérifie si l'activité existe déjà
    - Met à jour si l'activité a été modifiée
    - Ajoute seulement les nouvelles activités
    """
    print(f"Début de sauvegarde de {len(activities)} activités pour l'athlète {athlete_id}")
    updated_count = 0
    new_count = 0
    
    for act in activities:
        activity = act["activity_data"]
        activity_id = activity["id"]
        streams = act.get("streams", {})
        best_efforts = act.get("best_efforts", [])

        # Vérifie si l'activité existe déjà en base
        existing = db.query(StravaActivity).filter_by(activity_id=activity_id).first()
        
        if existing:
            print(f"Activité {activity_id} existe déjà, mise à jour...")
            # Mise à jour de l'activité existante
            existing.name = activity.get("name")
            existing.type = activity.get("type")
            existing.start_date = datetime.fromisoformat(activity["start_date"].replace("Z", "+00:00"))
            existing.distance = activity.get("distance")
            existing.moving_time = activity.get("moving_time")
            existing.elapsed_time = activity.get("elapsed_time")
            existing.total_elevation_gain = activity.get("total_elevation_gain")
            existing.average_speed = activity.get("average_speed")
            existing.max_speed = activity.get("max_speed")
            existing.average_heartrate = activity.get("average_heartrate")
            existing.max_heartrate = activity.get("max_heartrate")
            existing.calories = activity.get("calories")
            
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
            
            existing.elevation_data = elevation_data
            existing.pace_data = pace_data
            existing.heartrate_data = heartrate_json
            existing.segments = segments_json
            existing.power_data = power_data
            existing.best_efforts = json.dumps(best_efforts)
            
            # Calcul des zones cardiaques et du score d'effort
            zone_data = None
            effort_score = 0.0
            zone_times = {
                "zone_1_time": 0.0,
                "zone_2_time": 0.0,
                "zone_3_time": 0.0,
                "zone_4_time": 0.0,
                "zone_5_time": 0.0,
                "below_zone_1_time": 0.0,
                "above_zone_5_time": 0.0
            }
            
            if heartrate_json:
                # Calculer les zones cardiaques
                zone_data = calculate_heart_rate_zones(heartrate_json)
                if zone_data and "zones" in zone_data:
                    # Extraire les temps par zone
                    for zone_name, zone_info in zone_data["zones"].items():
                        if zone_name in zone_times:
                            zone_times[zone_name] = zone_info.get("time_minutes", 0.0)
                    
                    # Calculer le score d'effort
                    effort_score = calculate_effort_score(zone_data)

            # Mise à jour des zones cardiaques et du score
            existing.zone_1_time = zone_times["zone_1_time"]
            existing.zone_2_time = zone_times["zone_2_time"]
            existing.zone_3_time = zone_times["zone_3_time"]
            existing.zone_4_time = zone_times["zone_4_time"]
            existing.zone_5_time = zone_times["zone_5_time"]
            existing.below_zone_1_time = zone_times["below_zone_1_time"]
            existing.above_zone_5_time = zone_times["above_zone_5_time"]
            existing.effort_score = effort_score
            
            updated_count += 1
        else:
            print(f"Nouvelle activité {activity_id} trouvée, création...")
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

            # Calcul des zones cardiaques et du score d'effort (ajouté ici)
            zone_data = None
            effort_score = 0.0
            zone_times = {
                "zone_1_time": 0.0,
                "zone_2_time": 0.0,
                "zone_3_time": 0.0,
                "zone_4_time": 0.0,
                "zone_5_time": 0.0,
                "below_zone_1_time": 0.0,
                "above_zone_5_time": 0.0
            }
            if heartrate_json:
                zone_data = calculate_heart_rate_zones(heartrate_json)
                if zone_data and "zones" in zone_data:
                    for zone_name, zone_info in zone_data["zones"].items():
                        if zone_name in zone_times:
                            zone_times[zone_name] = zone_info.get("time_minutes", 0.0)
                    effort_score = calculate_effort_score(zone_data)

            # Création d'une nouvelle activité
            new_act = StravaActivity(
                athlete_id=athlete_id,
                activity_id=activity_id,
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
                best_efforts=json.dumps(best_efforts),
                # Zones cardiaques et score d'effort
                zone_1_time=zone_times["zone_1_time"],
                zone_2_time=zone_times["zone_2_time"],
                zone_3_time=zone_times["zone_3_time"],
                zone_4_time=zone_times["zone_4_time"],
                zone_5_time=zone_times["zone_5_time"],
                below_zone_1_time=zone_times["below_zone_1_time"],
                above_zone_5_time=zone_times["above_zone_5_time"],
                effort_score=effort_score
            )
            db.add(new_act)
            new_count += 1

    db.commit()
    print(f"Sauvegarde terminée: {new_count} nouvelles activités, {updated_count} mises à jour")
    
    return {
        "new_activities": new_count,
        "updated_activities": updated_count,
        "total_processed": len(activities)
    }


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
        print(f"Erreur lors de la récupération des détails de l'activité {activity_id}: {resp_detail.status_code}")
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
    
    if resp_stream.status_code != 200:
        print(f"Erreur lors de la récupération des streams de l'activité {activity_id}: {resp_stream.status_code}")
        streams = {}
    else:
        streams = resp_stream.json()

    result = {
        "activity_data": data,
        "streams": streams,
        "best_efforts": data.get("best_efforts", [])
    }
    
    print(f"Activité {activity_id} récupérée avec succès: {len(streams)} types de streams")
    return result


def get_latest_activity_date(db: Session, athlete_id: int) -> datetime:
    """
    Récupère la date de la plus récente activité pour un athlète.
    Utilisé pour récupérer seulement les nouvelles activités.
    """
    latest = db.query(StravaActivity).filter_by(athlete_id=athlete_id).order_by(StravaActivity.start_date.desc()).first()
    return latest.start_date if latest else None


def get_activity_count(db: Session, athlete_id: int) -> int:
    """
    Récupère le nombre total d'activités pour un athlète.
    """
    return db.query(StravaActivity).filter_by(athlete_id=athlete_id).count()


def get_activities_summary(db: Session, athlete_id: int) -> dict:
    """
    Récupère un résumé des activités pour un athlète.
    """
    activities = db.query(StravaActivity).filter_by(athlete_id=athlete_id).all()
    
    if not activities:
        return {
            "total_activities": 0,
            "latest_activity": None,
            "activity_types": {},
            "total_distance": 0,
            "total_time": 0
        }
    
    # Statistiques
    activity_types = {}
    total_distance = 0
    total_time = 0
    
    for activity in activities:
        # Types d'activités
        activity_type = activity.type or "Unknown"
        activity_types[activity_type] = activity_types.get(activity_type, 0) + 1
        
        # Distance et temps
        if activity.distance:
            total_distance += activity.distance
        if activity.moving_time:
            total_time += activity.moving_time
    
    return {
        "total_activities": len(activities),
        "latest_activity": max(act.start_date for act in activities),
        "activity_types": activity_types,
        "total_distance": total_distance,
        "total_time": total_time
    }