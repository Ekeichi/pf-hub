"""
Point d'entrée principal de l'application FastAPI.
Configure et lance le serveur avec :
- Les routes API
- Les middlewares
- La configuration CORS
- Les gestionnaires d'erreurs
"""

from fastapi import FastAPI
from app.api import predict, strava
from app.models.strava_token import Base
from app.models.strava_activity import Base as ActivityBase
from app.database import engine
from app.api import test

# Création des tables de la base de données
Base.metadata.create_all(bind=engine)
ActivityBase.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(predict.router, prefix="/api", tags=["Prediction"])
app.include_router(strava.router, prefix="/api", tags=["Strava"])
app.include_router(test.router, prefix="/api", tags=["Test"])

app.include_router(test.router, prefix="/api/test")

