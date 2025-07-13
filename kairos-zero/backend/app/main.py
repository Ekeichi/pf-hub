"""
Point d'entrée principal de l'application FastAPI.
Configure et lance le serveur avec :
- Les routes API
- Les middlewares
- La configuration CORS
- Les gestionnaires d'erreurs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import predict, strava, test, upload, auth_routes, newsletter
from app.models.strava_token import Base
from app.models.strava_activity import Base as ActivityBase
from app.models.user import Base as UserBase
from app.models.newsletter import Base as NewsletterBase
from app.database import engine

# Création des tables de la base de données
Base.metadata.create_all(bind=engine)
ActivityBase.metadata.create_all(bind=engine)
UserBase.metadata.create_all(bind=engine)
NewsletterBase.metadata.create_all(bind=engine)

app = FastAPI(
    title="PeakFlow Kairos Zero API",
    description="API for running performance analysis",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes
app.include_router(auth_routes.router, prefix="/api", tags=["Authentication"])
app.include_router(predict.router, prefix="/api", tags=["Prediction"])
app.include_router(strava.router, prefix="/api", tags=["Strava"])
app.include_router(test.router, prefix="/api/test", tags=["Test"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(newsletter.router, prefix="/api", tags=["Newsletter"])



@app.get("/")
def read_root():
    """Route racine de l'API."""
    return {
        "message": "Bienvenue sur l'API PeakFlow Kairos Zero",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Route de vérification de santé de l'API."""
    return {"status": "healthy"}

