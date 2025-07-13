"""
Point d'entrée pour l'upload de fichiers GPX.
Gère la route POST /upload-gpx qui permet aux utilisateurs
de télécharger leurs fichiers GPX d'entraînement pour analyse.
"""

import os
from fastapi import UploadFile, File, APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.prediction_service import predict_race_time
from app.dependencies.auth import get_current_user
from app.models.user import User
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Chemin de sauvegarde cohérent avec le reste de l'application
UPLOAD_DIR = "app/data/gpx_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-gpx")
async def upload_gpx_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Vérifier l'extension du fichier
    if not file.filename.endswith('.gpx'):
        raise HTTPException(status_code=400, detail="Type de fichier invalide. Seuls les fichiers .gpx sont acceptés.")

    filepath = os.path.join(UPLOAD_DIR, file.filename)
    logger.info(f"Tentative de sauvegarde du fichier : {filepath}")

    try:
        # Lire le contenu du fichier
        content = await file.read()
        
        # Utiliser un buffer pour écrire le fichier
        with open(filepath, "wb") as buffer:
            buffer.write(content)
        
        file_size = os.path.getsize(filepath)
        logger.info(f"Fichier '{file.filename}' sauvegardé avec succès ({file_size} octets).")
        
        # Faire la prédiction
        try:
            logger.info(f"Début de la prédiction pour l'utilisateur {current_user.id}")
            
            # Récupérer le vrai athlete_id Strava
            from app.utils.strava_auth import get_athlete_id_from_token
            athlete_id = get_athlete_id_from_token(db, current_user)
            logger.info(f"Athlete ID Strava: {athlete_id}")
            logger.info(f"Fichier GPX: {filepath}")
            
            predicted_time_minutes, total_distance = predict_race_time(filepath, db, athlete_id)
            
            logger.info(f"Prédiction réussie: {predicted_time_minutes} minutes, {total_distance} mètres")
            
            # Calculer le dénivelé à partir du fichier GPX
            from app.utils.gpx_tools import parse_gpx, calculate_elevation_stats, calculate_elevation_gain
            points = parse_gpx(filepath)
            
            # Utiliser la fonction améliorée pour un dénivelé plus réaliste
            elevation_gain = calculate_elevation_gain(points, min_distance=30.0, min_elevation_gain=1.5)
            
            # Calculer aussi les stats complètes pour le debug
            elevation_stats = calculate_elevation_stats(points)
            
            logger.info(f"Statistiques d'élévation: gain={elevation_gain:.0f}m (lissé), gain_raw={elevation_stats['elevation_gain']:.0f}m (brut), perte={elevation_stats['elevation_loss']:.0f}m, min={elevation_stats['min_elevation']:.0f}m, max={elevation_stats['max_elevation']:.0f}m")
            
            # Convertir le temps en format HH:MM:SS
            hours = int(predicted_time_minutes // 60)
            minutes = int(predicted_time_minutes % 60)
            seconds = int((predicted_time_minutes % 1) * 60)
            predicted_time_str = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            
            # Calculer la difficulté basée sur la distance et le dénivelé
            difficulty = "Easy"
            if total_distance > 20000:  # Plus de 20km
                difficulty = "Difficult"
            elif total_distance > 10000:  # Plus de 10km
                difficulty = "Moderate"
            
            # Ajuster la difficulté en fonction du dénivelé
            if elevation_gain > 1000:  # Plus de 1000m de dénivelé
                difficulty = "Very difficult"
            elif elevation_gain > 500:  # Plus de 500m de dénivelé
                if difficulty == "Easy":
                    difficulty = "Moderate"
                elif difficulty == "Moderate":
                    difficulty = "Difficult"
            
            # Calculer un niveau de confiance basé sur la quantité de données d'entraînement
            confidence = 75  # Valeur par défaut
            
            # Générer des recommandations basées sur la difficulté et le dénivelé
            recommendations = []
            if difficulty == "Very difficult":
                recommendations = [
                    "Prepare with long mountain training sessions",
                    "Stay hydrated regularly during effort",
                    "Plan frequent refueling",
                    "Train on similar courses"
                ]
            elif difficulty == "Difficult":
                recommendations = [
                    "Prepare with long training sessions",
                    "Stay hydrated regularly during effort",
                    "Plan refueling"
                ]
            elif difficulty == "Moderate":
                recommendations = [
                    "Maintain a steady pace",
                    "Listen to your body",
                    "Stay well hydrated"
                ]
            else:
                recommendations = [
                    "Enjoy your race!"
                ]
            
            logger.info(f"Résultats finaux: temps={predicted_time_str}, distance={total_distance}, dénivelé={elevation_gain}, difficulté={difficulty}")
            
            return {
                "message": "GPX file uploaded and analyzed successfully",
                "filename": file.filename,
                "path": filepath,
                "size": file_size,
                "predicted_time": predicted_time_str,
                "confidence": confidence,
                "distance": total_distance,
                "elevation_gain": int(elevation_gain),
                "difficulty": difficulty,
                "recommendations": recommendations
            }
            
        except Exception as pred_error:
            logger.error(f"Erreur détaillée lors de la prédiction : {pred_error}")
            logger.error(f"Type d'erreur : {type(pred_error)}")
            import traceback
            logger.error(f"Traceback complet : {traceback.format_exc()}")
            
            # Retourner juste les infos du fichier si la prédiction échoue
            return {
                "message": "Fichier GPX uploadé avec succès, mais erreur lors de l'analyse",
                "filename": file.filename,
                "path": filepath,
                "size": file_size,
                "error": f"Impossible de générer la prédiction: {str(pred_error)}"
            }
            
    except Exception as e:
        logger.error(f"Erreur lors de la sauvegarde du fichier : {e}")
        raise HTTPException(status_code=500, detail=f"Impossible de sauvegarder le fichier : {e}")