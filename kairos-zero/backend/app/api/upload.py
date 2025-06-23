"""
Point d'entrée pour l'upload de fichiers GPX.
Gère la route POST /upload-gpx qui permet aux utilisateurs
de télécharger leurs fichiers GPX d'entraînement pour analyse.
"""

import os
from fastapi import UploadFile, File, APIRouter, HTTPException
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Chemin de sauvegarde cohérent avec le reste de l'application
UPLOAD_DIR = "app/data/gpx_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-gpx")
async def upload_gpx_file(file: UploadFile = File(...)):
    # Vérifier l'extension du fichier
    if not file.filename.endswith('.gpx'):
        raise HTTPException(status_code=400, detail="Type de fichier invalide. Seuls les fichiers .gpx sont acceptés.")

    filepath = os.path.join(UPLOAD_DIR, file.filename)
    logger.info(f"Tentative de sauvegarde du fichier : {filepath}")

    try:
        # Utiliser un buffer pour lire le fichier par morceaux (plus sûr pour les gros fichiers)
        with open(filepath, "wb") as buffer:
        content = await file.read()
            buffer.write(content)
        
        file_size = os.path.getsize(filepath)
        logger.info(f"Fichier '{file.filename}' sauvegardé avec succès ({file_size} octets).")
        
        return {
            "message": "Fichier GPX uploadé avec succès",
            "filename": file.filename,
            "path": filepath,
            "size": file_size
        }
    except Exception as e:
        logger.error(f"Erreur lors de la sauvegarde du fichier : {e}")
        raise HTTPException(status_code=500, detail=f"Impossible de sauvegarder le fichier : {e}")