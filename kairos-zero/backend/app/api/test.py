import os
import glob
import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.prediction_service import predict_race_time
from app.models.strava_token import StravaToken
from app.models.strava_activity import StravaActivity
import time

router = APIRouter(tags=["test"])

@router.post("/create-test-activities/{athlete_id}")
def create_test_activities(athlete_id: int, db: Session = Depends(get_db)):
    """
    Route de test pour créer des activités fictives pour un utilisateur donné.
    """
    # Vérifier que l'utilisateur existe
    user = db.query(StravaToken).filter_by(athlete_id=athlete_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Utilisateur {athlete_id} non trouvé")
    
    # Créer quelques activités de test
    test_activities = []
    
    for i in range(5):  # Créer 5 activités
        activity_date = datetime.now() - timedelta(days=i*7)  # Une activité par semaine
        
        # Données d'activité fictives
        activity = StravaActivity(
            athlete_id=athlete_id,
            activity_id=100000000 + i,  # ID unique
            name=f"Course d'entraînement {i+1}",
            type="Run",
            start_date=activity_date,
            distance=5000 + (i * 1000),  # 5km, 6km, 7km, etc.
            moving_time=1800 + (i * 300),  # 30min, 35min, etc.
            elapsed_time=1900 + (i * 300),
            total_elevation_gain=50 + (i * 10),
            average_speed=3.0 + (i * 0.2),
            max_speed=4.0 + (i * 0.3),
            average_heartrate=150 + (i * 5),
            max_heartrate=180 + (i * 5),
            calories=300 + (i * 50),
            # Données JSON pour la prédiction
            elevation_data=json.dumps({
                "distance": [0, 1, 2, 3, 4, 5],
                "altitude": [100, 105, 110, 108, 112, 115]
            }),
            pace_data=json.dumps({
                "time": [0, 300, 600, 900, 1200, 1500],
                "distance": [0, 1, 2, 3, 4, 5],
                "velocity": [3.2, 3.1, 3.3, 3.0, 3.4, 3.2]
            }),
            heartrate_data=json.dumps({
                "time": [0, 300, 600, 900, 1200, 1500],
                "heartrate": [140, 150, 155, 160, 165, 170]
            })
        )
        
        test_activities.append(activity)
        db.add(activity)
    
    db.commit()
    
    return {
        "message": f"5 activités de test créées pour l'utilisateur {athlete_id}",
        "activities_created": len(test_activities),
        "activity_ids": [act.activity_id for act in test_activities]
    }

@router.get("/list-activities/{athlete_id}")
def list_activities(athlete_id: int, db: Session = Depends(get_db)):
    """
    Route de test pour lister toutes les activités d'un utilisateur.
    """
    activities = db.query(StravaActivity).filter_by(athlete_id=athlete_id).all()
    return {
        "athlete_id": athlete_id,
        "activities": [
            {
                "id": act.id,
                "activity_id": act.activity_id,
                "name": act.name,
                "type": act.type,
                "distance": act.distance,
                "moving_time": act.moving_time,
                "has_elevation_data": act.elevation_data is not None,
                "has_pace_data": act.pace_data is not None,
                "has_heartrate_data": act.heartrate_data is not None
            }
            for act in activities
        ]
    }

@router.post("/create-test-user")
def create_test_user(db: Session = Depends(get_db)):
    """
    Route de test pour créer un utilisateur fictif dans la base de données.
    """
    # Créer un token fictif
    test_token = StravaToken(
        athlete_id=99999999,  # ID fictif
        access_token="test_access_token_123",
        refresh_token="test_refresh_token_123",
        expires_at=int(time.time()) + 3600  # Expire dans 1 heure
    )
    
    db.add(test_token)
    db.commit()
    db.refresh(test_token)
    
    return {
        "message": "Utilisateur de test créé avec succès",
        "athlete_id": test_token.athlete_id,
        "token_id": test_token.id
    }

@router.get("/list-users")
def list_users(db: Session = Depends(get_db)):
    """
    Route de test pour lister tous les utilisateurs dans la base.
    """
    users = db.query(StravaToken).all()
    return {
        "users": [
            {
                "id": user.id,
                "athlete_id": user.athlete_id,
                "expires_at": user.expires_at
            }
            for user in users
        ]
    }

@router.get("/test-simple")
def test_simple_with_latest_gpx(db: Session = Depends(get_db)):
    """
    Route de test qui utilise le dernier fichier GPX uploadé pour faire une prédiction.
    """
    # Chercher le dernier fichier GPX dans le dossier d'uploads
    upload_dir = "app/data/gpx_uploads"
    list_of_files = glob.glob(f'{upload_dir}/*.gpx')
    if not list_of_files:
        raise HTTPException(status_code=404, detail="Aucun fichier GPX trouvé dans le dossier d'uploads.")
    
    # Trouver le fichier le plus récent
    latest_file = max(list_of_files, key=os.path.getctime)
    
    athlete_id = 32883472  # ID de test, à adapter si besoin
    result, distance = predict_race_time(latest_file, db, athlete_id)
    
    # Conversion du temps en format lisible
    hours = int(result // 60)
    minutes = int(result % 60)
    
    return {
        "message": "Test de prédiction réussi !",
        "fichier_gpx_utilise": os.path.basename(latest_file),
        "temps_predit": f"{hours}h{minutes}min",
        "distance_km": f"{distance/1000:.2f} km"
    }

@router.get("/predict")
def test_prediction(db: Session = Depends(get_db)):
    gpx_path = "app/data/la-6000d-2025-la-6d-marathon.gpx"
    athlete_id = 32883472  # à adapter
    result, distance = predict_race_time(gpx_path, db, athlete_id)
    return {
        "predicted_time_minutes": result,
        "distance_m": distance
    }


@router.get("/status")
def get_status():
    return {"status": "OK"}