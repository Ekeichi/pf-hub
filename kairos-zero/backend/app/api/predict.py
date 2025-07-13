"""
Point d'entrée pour les prédictions de performance.
Gère la route POST /predict qui permet de prédire les performances
sur différentes distances (5k, 10k, semi, marathon) à partir
des données d'entraînement.
"""

from fastapi import APIRouter
from app.services.prediction_service import predict_race_time

router = APIRouter()

@router.post("/predict")
def predict_endpoint(gpx_path: str, training_log_path: str):
    prediction, distance = predict_race_time(gpx_path, training_log_path)
    return {"prediction": prediction, "distance": distance}
