"""
Point d'entrée pour les analyses de performance.
Gère la route GET /analytics qui permet de récupérer les données ACWR et FFM
pour l'utilisateur connecté.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
import pandas as pd
import numpy as np
from sqlalchemy import text

router = APIRouter()



from app.utils.ffm import ACWR, courbe_ffm, clean_nan_values

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Récupère les données d'analyse (ACWR et FFM) pour l'utilisateur connecté"""
    try:
        # Récupérer toutes les activités de l'utilisateur pour des calculs précis
        result = db.execute(text("SELECT start_date, effort_score FROM strava_activities WHERE effort_score IS NOT NULL AND user_id = :user_id ORDER BY start_date"), {"user_id": current_user.id})
        
        data = [
            {"start_date": row[0], "effort_score": row[1]}
            for row in result
        ]
        
        if not data:
            return {"error": "Aucune donnée trouvée pour cet utilisateur"}
        
        df = pd.DataFrame(data)
        df['start_date'] = pd.to_datetime(df['start_date'])
        
        # Calculer ACWR sur toutes les données
        df_acwr = ACWR(df)
        
        # Calculer FFM sur toutes les données
        courbe_fatigue, courbe_fitness, courbe_performance, courbe_forme, courbe_rapport, fatigue_pre, fitness_pre = courbe_ffm(df)
        
        # Filtrer pour ne garder que les 30 derniers jours
        date_limite = pd.Timestamp.now() - pd.Timedelta(days=30)
        df_recent = df[df['start_date'] >= date_limite]
        df_acwr_recent = df_acwr[df_acwr['start_date'] >= date_limite]
        
        # Obtenir les indices des 30 derniers jours pour les courbes FFM
        recent_indices = df[df['start_date'] >= date_limite].index
        start_idx = max(0, len(courbe_fatigue) - len(recent_indices))
        
        # Préparer les données pour le frontend avec nettoyage des NaN (30 derniers jours seulement)
        acwr_data = {
            "dates": df_acwr_recent['start_date'].dt.strftime('%Y-%m-%d').tolist(),
            "charge_aigue": clean_nan_values(df_acwr_recent['Charge_aigue'].tolist()),
            "charge_chronique": clean_nan_values(df_acwr_recent['Charge_chronique'].tolist()),
            "ratio_ac": clean_nan_values(df_acwr_recent['Ratio_AC'].tolist())
        }
        
        ffm_data = {
            "dates": df_recent['start_date'].dt.strftime('%Y-%m-%d').tolist(),
            "fatigue": clean_nan_values(courbe_fatigue[start_idx:]),
            "fitness": clean_nan_values(courbe_fitness[start_idx:]),
            "performance": clean_nan_values(courbe_performance[start_idx:]),
            "forme": clean_nan_values(courbe_forme[start_idx:]),
            "rapport": clean_nan_values(courbe_rapport[start_idx:])
        }
        
        return {
            "acwr": acwr_data,
            "ffm": ffm_data
        }
        
    except Exception as e:
        return {"error": f"Erreur lors du calcul des analyses: {str(e)}"} 