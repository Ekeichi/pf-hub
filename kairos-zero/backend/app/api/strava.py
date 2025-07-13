from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse, StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import STRAVA_CLIENT_ID, REDIRECT_URI
from app.services.strava_service import StravaService
from app.repositories.strava_token import upsert_strava_token
from app.models.strava_token import StravaToken
from app.models.strava_activity import StravaActivity
from app.repositories.strava_activity import save_activities, fetch_full_activity_details, get_latest_activity_date, get_activities_summary
from app.utils.strava_auth import get_current_token, get_athlete_id_from_token
from app.dependencies.auth import get_current_user
from app.models.user import User
import requests
import asyncio
import time
import pandas as pd
import numpy as np
from datetime import datetime
import os

router = APIRouter()
service = StravaService()

@router.get("/strava/auth")
def auth():
    url = (
        "https://www.strava.com/oauth/authorize"
        f"?client_id={STRAVA_CLIENT_ID}"
        f"&response_type=code"
        f"&redirect_uri={REDIRECT_URI}"
        f"&scope=read,activity:read_all"
        f"&approval_prompt=auto"
    )
    return RedirectResponse(url)

@router.get("/strava/callback")
def callback(code: str, db: Session = Depends(get_db)):
    data = service.exchange_code(code)

    # Sauvegarde du token Strava (sans user_id pour l'instant)
    upsert_strava_token(
        db,
        athlete_id=data["athlete"]["id"],
        access_token=data["access_token"],
        refresh_token=data["refresh_token"],
        expires_at=data["expires_at"]
    )

    # Redirige vers le frontend après succès (URL dynamique selon l'environnement)
    ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
    if ENVIRONMENT == "production":
        frontend_url = "https://pf-hub-frontend.onrender.com/strava-success"
    else:
        frontend_url = "http://localhost:5173/strava-success"
    
    return RedirectResponse(frontend_url)

@router.post("/strava/link-token")
def link_strava_token_to_user(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Lie le token Strava le plus récent à l'utilisateur connecté.
    """
    try:
        # Vérifier si l'utilisateur a déjà un token lié
        existing_token = db.query(StravaToken).filter_by(user_id=current_user.id).first()
        if existing_token:
            return {"message": "Token Strava déjà lié", "athlete_id": existing_token.athlete_id}
        
        # Récupérer le token Strava le plus récent sans user_id
        token_entry = db.query(StravaToken).filter_by(user_id=None).order_by(StravaToken.id.desc()).first()
        
        if not token_entry:
            raise HTTPException(status_code=404, detail="Aucun token Strava non lié trouvé. Veuillez d'abord autoriser l'application Strava.")
        
        # Lier le token à l'utilisateur connecté
        token_entry.user_id = current_user.id
        db.commit()
        
        return {"message": "Token Strava lié avec succès", "athlete_id": token_entry.athlete_id}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erreur lors de la liaison du token: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la liaison du token: {str(e)}")

@router.get("/strava/activities")
def get_activities(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    athlete_id = get_athlete_id_from_token(db, current_user)
    token = get_current_token(db, current_user)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Récupération des activités (liste de base)
    url = "https://www.strava.com/api/v3/athlete/activities"
    resp = requests.get(url, headers=headers, params={"per_page": 50})

    # Ajout d'une gestion d'erreur robuste
    if resp.status_code != 200:
        raise HTTPException(
            status_code=resp.status_code, 
            detail=f"Erreur de l'API Strava: {resp.text}"
        )
        
    base_activities = resp.json()

    # Vérification que la réponse est bien une liste
    if not isinstance(base_activities, list):
        raise HTTPException(
            status_code=400, 
            detail=f"Réponse inattendue de l'API Strava (ce n'est pas une liste): {base_activities}"
        )

    detailed_activities = []
    for act in base_activities:
        activity_id = act.get("id")
        if not activity_id:
            continue # On passe à la suite si l'activité n'a pas d'ID

        full_data = fetch_full_activity_details(token, activity_id)
        if full_data:
            detailed_activities.append(full_data)

    result = save_activities(db, athlete_id, detailed_activities)

    return {
        "status": "OK", 
        "new_activities": result["new_activities"],
        "updated_activities": result["updated_activities"],
        "total_processed": result["total_processed"]
    }

def make_strava_request_with_retry(url, headers, params=None, max_retries=3, delay=1):
    """
    Fait une requête à l'API Strava avec retry automatique en cas d'erreur.
    """
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, params=params, timeout=30)
            
            if response.status_code == 200:
                return response
            
            # Si c'est une erreur de rate limiting, on attend plus longtemps
            if response.status_code == 429:
                wait_time = delay * (2 ** attempt)  # Backoff exponentiel
                time.sleep(wait_time)
                continue
                
            # Pour les autres erreurs, on attend un peu puis on réessaie
            if response.status_code >= 500:
                time.sleep(delay)
                continue
                
            # Si c'est une erreur client (4xx), on ne réessaie pas
            return response
            
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                time.sleep(delay)
                continue
            raise HTTPException(status_code=408, detail="Timeout lors de la requête à Strava")
            
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                time.sleep(delay)
                continue
            raise HTTPException(status_code=500, detail=f"Erreur réseau: {str(e)}")
    
    # Si on arrive ici, toutes les tentatives ont échoué
    raise HTTPException(status_code=500, detail="Impossible de récupérer les données de Strava après plusieurs tentatives")

async def stream_activity_sync(db: Session, current_user: User):
    """
    Générateur qui récupère les activités, les sauvegarde,
    et streame l'état d'avancement.
    """
    yield "data: Connexion à Strava...\n\n"
    await asyncio.sleep(1)

    athlete_id = get_athlete_id_from_token(db, current_user)
    token = get_current_token(db, current_user)
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Récupération de la liste des activités
    url = "https://www.strava.com/api/v3/athlete/activities"
    
    try:
        resp = make_strava_request_with_retry(url, headers, {"per_page": 200})
    except HTTPException as e:
        yield f"data: Erreur - {e.detail}\n\n"
        return

    base_activities = resp.json()
    if not isinstance(base_activities, list):
        yield "data: Erreur - Réponse inattendue de Strava\n\n"
        return
    
    total_activities = len(base_activities)
    yield f"data: {total_activities} activités à synchroniser...\n\n"
    await asyncio.sleep(1)

    # 2. Récupération des détails et sauvegarde
    new_activities_count = 0
    updated_activities_count = 0
    for i, act in enumerate(base_activities):
        activity_id = act.get("id")
        if not activity_id:
            continue
        
        # Envoi de l'état d'avancement
        progress = int(((i + 1) / total_activities) * 100)
        yield f"data: {{\"progress\": {progress}, \"message\": \"Chargement de l'activité {i+1}/{total_activities}\"}}\n\n"

        try:
            full_data = fetch_full_activity_details(token, activity_id)
            if full_data:
                result = save_activities(db, athlete_id, [full_data])
                new_activities_count += result["new_activities"]
                updated_activities_count += result["updated_activities"]
            
            # Délai entre les requêtes pour éviter le rate limiting
            await asyncio.sleep(0.5)
            
        except Exception as e:
            yield f"data: {{\"progress\": {progress}, \"message\": \"Erreur sur l'activité {i+1}: {str(e)}\"}}\n\n"
            continue

    yield f"data: Synchronisation terminée ! {new_activities_count} nouvelles activités, {updated_activities_count} mises à jour.\n\n"

@router.get("/strava/sync-activities")
async def sync_activities_stream(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return StreamingResponse(
        stream_activity_sync(db, current_user),
        media_type="text/event-stream"
    )

@router.get("/strava/sync-simple")
def sync_activities_simple(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Version simple de la synchronisation qui retourne un résultat JSON.
    """
    try:
        athlete_id = get_athlete_id_from_token(db, current_user)
        token = get_current_token(db, current_user)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Récupération de la liste des activités
        url = "https://www.strava.com/api/v3/athlete/activities"
        resp = make_strava_request_with_retry(url, headers, {"per_page": 200})
        
        base_activities = resp.json()
        if not isinstance(base_activities, list):
            raise HTTPException(status_code=400, detail="Réponse inattendue de Strava")
        
        total_activities = len(base_activities)
        new_activities_count = 0
        updated_activities_count = 0
        
        # Récupération des détails et sauvegarde
        for i, act in enumerate(base_activities):
            activity_id = act.get("id")
            if not activity_id:
                continue
            
            try:
                full_data = fetch_full_activity_details(token, activity_id)
                if full_data:
                    result = save_activities(db, athlete_id, [full_data])
                    new_activities_count += result["new_activities"]
                    updated_activities_count += result["updated_activities"]
                
                # Délai entre les requêtes pour éviter le rate limiting
                time.sleep(0.5)
                
            except Exception as e:
                print(f"Erreur sur l'activité {i+1}: {str(e)}")
                continue
        
        return {
            "status": "success",
            "message": f"Synchronisation terminée ! {new_activities_count} nouvelles activités, {updated_activities_count} mises à jour.",
            "total_activities_processed": total_activities,
            "new_activities": new_activities_count,
            "updated_activities": updated_activities_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la synchronisation: {str(e)}")

@router.get("/strava/sync-activities-fast")
async def sync_activities_fast(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Version rapide de la synchronisation avec système de cache intelligent.
    """
    try:
        athlete_id = get_athlete_id_from_token(db, current_user)
        token = get_current_token(db, current_user)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Récupération de la liste des activités (limité à 50 pour la rapidité)
        url = "https://www.strava.com/api/v3/athlete/activities"
        resp = make_strava_request_with_retry(url, headers, {"per_page": 50})
        
        base_activities = resp.json()
        if not isinstance(base_activities, list):
            raise HTTPException(status_code=400, detail="Réponse inattendue de Strava")
        
        total_activities = len(base_activities)
        successful_syncs = 0
        
        # Récupération des détails et sauvegarde intelligente
        for i, act in enumerate(base_activities):
            activity_id = act.get("id")
            if not activity_id:
                continue
            
            try:
                full_data = fetch_full_activity_details(token, activity_id)
                if full_data:
                    result = save_activities(db, athlete_id, [full_data])
                    successful_syncs += result["new_activities"]
                
                # Délai réduit entre les requêtes
                time.sleep(0.2)  # 200ms au lieu de 500ms
                
            except Exception as e:
                print(f"Erreur sur l'activité {i+1}: {str(e)}")
                continue
        
        return {
            "status": "OK", 
            "total_activities_processed": total_activities,
            "new_activities_added": successful_syncs,
            "message": f"Synchronisation rapide terminée : {successful_syncs} nouvelles activités ajoutées"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la synchronisation : {str(e)}")

@router.get("/strava/sync-intelligent")
async def sync_activities_intelligent(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Synchronisation intelligente qui récupère seulement les nouvelles activités
    et met à jour les activités modifiées.
    """
    try:
        print(f"Début de synchronisation intelligente pour l'utilisateur {current_user.id}")
        
        athlete_id = get_athlete_id_from_token(db, current_user)
        print(f"Athlete ID récupéré: {athlete_id}")
        
        token = get_current_token(db, current_user)
        print(f"Token récupéré: {token[:20]}...")
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Récupération de la date de la dernière activité
        latest_date = get_latest_activity_date(db, athlete_id)
        print(f"Date de la dernière activité: {latest_date}")
        
        # Récupération de la liste des activités depuis Strava
        url = "https://www.strava.com/api/v3/athlete/activities"
        resp = make_strava_request_with_retry(url, headers, {"per_page": 200})
        
        base_activities = resp.json()
        if not isinstance(base_activities, list):
            raise HTTPException(status_code=400, detail="Réponse inattendue de Strava")
        
        print(f"Nombre d'activités récupérées de Strava: {len(base_activities)}")
        
        # Filtrage des nouvelles activités seulement
        new_activities = []
        if latest_date:
            for act in base_activities:
                # Convertir la date Strava en datetime sans fuseau horaire pour la comparaison
                activity_date = datetime.fromisoformat(act["start_date"].replace("Z", "+00:00"))
                # Supprimer le fuseau horaire pour la comparaison avec la date de la base
                activity_date_naive = activity_date.replace(tzinfo=None)
                if activity_date_naive > latest_date:
                    new_activities.append(act)
        else:
            # Première synchronisation : prendre toutes les activités
            new_activities = base_activities
        
        print(f"Nombre de nouvelles activités à synchroniser: {len(new_activities)}")
        
        total_new = len(new_activities)
        successful_syncs = 0
        
        # Récupération des détails et sauvegarde intelligente
        for i, act in enumerate(new_activities):
            activity_id = act.get("id")
            if not activity_id:
                continue
            
            try:
                full_data = fetch_full_activity_details(token, activity_id)
                if full_data:
                    result = save_activities(db, athlete_id, [full_data])
                    successful_syncs += result["new_activities"]
                
                # Délai réduit entre les requêtes
                time.sleep(0.2)
                
            except Exception as e:
                print(f"Erreur sur l'activité {i+1}: {str(e)}")
                continue
        
        # Récupération du résumé des activités
        summary = get_activities_summary(db, athlete_id)
        
        print(f"Synchronisation terminée: {successful_syncs} activités synchronisées")
        
        return {
            "status": "OK",
            "sync_info": {
                "total_activities_in_strava": len(base_activities),
                "new_activities_found": total_new,
                "successfully_synced": successful_syncs,
                "last_sync_date": latest_date.isoformat() if latest_date else None
            },
            "summary": summary,
            "message": f"Synchronisation intelligente terminée : {successful_syncs} nouvelles activités ajoutées"
        }
        
    except Exception as e:
        print(f"Erreur lors de la synchronisation intelligente: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la synchronisation intelligente : {str(e)}")

@router.get("/strava/stats")
def get_activities_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Récupère les statistiques des activités synchronisées.
    """
    try:
        athlete_id = get_athlete_id_from_token(db, current_user)
        
        # Récupération des statistiques
        summary = get_activities_summary(db, athlete_id)
        latest_date = get_latest_activity_date(db, athlete_id)
        
        return {
            "status": "OK",
            "stats": {
                "total_activities": summary["total_activities"],
                "latest_activity_date": latest_date.isoformat() if latest_date else None,
                "activity_types": summary["activity_types"],
                "total_distance_km": round(summary["total_distance"] / 1000, 2) if summary["total_distance"] else 0,
                "total_time_hours": round(summary["total_time"] / 3600, 2) if summary["total_time"] else 0,
                "average_distance_per_activity": round((summary["total_distance"] / 1000) / summary["total_activities"], 2) if summary["total_activities"] > 0 else 0
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des statistiques : {str(e)}")

@router.get("/strava/recent-activities")
def get_recent_activities(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieves the 5 most recent activities of the connected user.
    """
    try:
        athlete_id = get_athlete_id_from_token(db, current_user)
        
        # Retrieving the 5 most recent activities
        recent_activities = db.query(StravaActivity).filter_by(athlete_id=athlete_id)\
            .order_by(StravaActivity.start_date.desc())\
            .limit(5)\
            .all()
        
        activities_list = []
        for activity in recent_activities:
            activities_list.append({
                "id": activity.activity_id,
                "name": activity.name,
                "type": activity.type,
                "start_date": activity.start_date.isoformat(),
                "distance_km": round(activity.distance / 1000, 2) if activity.distance else 0,
                "moving_time_minutes": round(activity.moving_time / 60, 1) if activity.moving_time else 0,
                "total_elevation_gain": round(activity.total_elevation_gain, 0) if activity.total_elevation_gain else 0,
                "average_speed_kmh": round(activity.average_speed * 3.6, 1) if activity.average_speed else 0,
                "effort_score": round(activity.effort_score, 2) if activity.effort_score else 0
            })
        
        return {
            "status": "OK",
            "activities": activities_list
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des activités récentes : {str(e)}")

@router.get("/strava/activity/{activity_id}/heart-rate-zones")
def get_activity_heart_rate_zones(
    activity_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves heart rate zones for a specific activity.
    """
    try:
        athlete_id = get_athlete_id_from_token(db, current_user)
        
        # Récupération de l'activité
        activity = db.query(StravaActivity).filter_by(
            athlete_id=athlete_id,
            activity_id=activity_id
        ).first()
        
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        # Preparing zone data
        zone_data = {
            "zone_1": {
                "time_minutes": activity.zone_1_time or 0,
                "description": "Récupération - Régénération et récupération"
            },
            "zone_2": {
                "time_minutes": activity.zone_2_time or 0,
                "description": "Endurance - Développement de l'endurance de base"
            },
            "zone_3": {
                "time_minutes": activity.zone_3_time or 0,
                "description": "Aérobie - Amélioration de la capacité aérobie"
            },
            "zone_4": {
                "time_minutes": activity.zone_4_time or 0,
                "description": "Seuil - Développement du seuil anaérobie"
            },
            "zone_5": {
                "time_minutes": activity.zone_5_time or 0,
                "description": "Anaérobie - Développement de la puissance maximale"
            },
            "below_zone_1": {
                "time_minutes": activity.below_zone_1_time or 0,
                "description": "En dessous de la zone 1"
            },
            "above_zone_5": {
                "time_minutes": activity.above_zone_5_time or 0,
                "description": "Au-dessus de la zone 5"
            }
        }
        
        # Calculating total time
        total_time = sum(zone["time_minutes"] for zone in zone_data.values())
        
        # Calculating percentages
        for zone in zone_data.values():
            zone["percentage"] = round((zone["time_minutes"] / total_time) * 100, 1) if total_time > 0 else 0
        
        return {
            "status": "OK",
            "activity_id": activity_id,
            "activity_name": activity.name,
            "total_time_minutes": round(total_time, 1),
            "effort_score": activity.effort_score or 0,
            "zones": zone_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving heart rate zones: {str(e)}")

# Import des fonctions FFM centralisées
from app.utils.ffm import ACWR, courbe_ffm, clean_nan_values

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Récupère les données d'analyse (ACWR et FFM) pour l'utilisateur connecté"""
    try:
        import pandas as pd
        import numpy as np
        from sqlalchemy import text
        
        athlete_id = get_athlete_id_from_token(db, current_user)
        
        # Récupérer toutes les activités de l'utilisateur pour des calculs précis
        result = db.execute(text("SELECT start_date, effort_score FROM strava_activities WHERE effort_score IS NOT NULL AND athlete_id = :athlete_id ORDER BY start_date"), {"athlete_id": athlete_id})
        
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
