from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.prediction_service import predict_race_time

router = APIRouter(tags=["test"])

@router.get("/test-simple")
def test_simple(db: Session = Depends(get_db)):
    """
    Route de test simple qui ne nécessite aucun paramètre.
    Utilise un fichier GPX de démo pour faire une prédiction rapide.
    """
    gpx_path = "app/data/la-6000d-2025-la-6d-marathon.gpx"
    athlete_id = 32883472  # ID de test
    result, distance = predict_race_time(gpx_path, db, athlete_id)
    
    # Conversion du temps en format lisible
    hours = int(result // 60)
    minutes = int(result % 60)
    
    return {
        "message": "Test de prédiction réussi !",
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


