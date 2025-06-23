from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse, StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import STRAVA_CLIENT_ID, REDIRECT_URI
from app.services.strava_service import StravaService
from app.repositories.strava_token import upsert_strava_token
from app.models.strava_token import StravaToken
from app.repositories.strava_activity import save_activities, fetch_full_activity_details
from app.utils.strava_auth import get_current_token, get_athlete_id_from_token
import requests
import asyncio
import time

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

    upsert_strava_token(
        db,
        athlete_id=data["athlete"]["id"],
        access_token=data["access_token"],
        refresh_token=data["refresh_token"],
        expires_at=data["expires_at"]
    )

    # Redirige vers le frontend après succès
    return RedirectResponse("http://localhost:5173/strava-success")

@router.get("/strava/activities")
def get_activities(db: Session = Depends(get_db), token: str = Depends(get_current_token)):
    athlete_id = get_athlete_id_from_token(db)
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

    save_activities(db, athlete_id, detailed_activities)

    return {"status": "OK", "saved": len(detailed_activities)}

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

async def stream_activity_sync(db: Session, token: str):
    """
    Générateur qui récupère les activités, les sauvegarde,
    et streame l'état d'avancement.
    """
    yield "data: Connexion à Strava...\n\n"
    await asyncio.sleep(1)

    athlete_id = get_athlete_id_from_token(db)
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
    successful_syncs = 0
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
                save_activities(db, athlete_id, [full_data])
                successful_syncs += 1
            
            # Délai entre les requêtes pour éviter le rate limiting
            await asyncio.sleep(0.5)
            
        except Exception as e:
            yield f"data: {{\"progress\": {progress}, \"message\": \"Erreur sur l'activité {i+1}: {str(e)}\"}}\n\n"
            continue

    yield f"data: Synchronisation terminée ! {successful_syncs}/{total_activities} activités synchronisées.\n\n"

@router.get("/strava/sync-activities")
async def sync_activities_stream(db: Session = Depends(get_db), token: str = Depends(get_current_token)):
    return StreamingResponse(
        stream_activity_sync(db, token),
        media_type="text/event-stream"
    )

@router.get("/strava/sync-simple")
def sync_activities_simple(db: Session = Depends(get_db), token: str = Depends(get_current_token)):
    """
    Version simple de la synchronisation qui retourne un résultat JSON.
    """
    try:
        athlete_id = get_athlete_id_from_token(db)
        headers = {"Authorization": f"Bearer {token}"}
        
        # Récupération de la liste des activités
        url = "https://www.strava.com/api/v3/athlete/activities"
        resp = make_strava_request_with_retry(url, headers, {"per_page": 200})
        
        base_activities = resp.json()
        if not isinstance(base_activities, list):
            raise HTTPException(status_code=400, detail="Réponse inattendue de Strava")
        
        total_activities = len(base_activities)
        successful_syncs = 0
        
        # Récupération des détails et sauvegarde
        for i, act in enumerate(base_activities):
            activity_id = act.get("id")
            if not activity_id:
                continue
            
            try:
                full_data = fetch_full_activity_details(token, activity_id)
                if full_data:
                    save_activities(db, athlete_id, [full_data])
                    successful_syncs += 1
                
                # Délai entre les requêtes pour éviter le rate limiting
                time.sleep(0.5)
                
            except Exception as e:
                print(f"Erreur sur l'activité {i+1}: {str(e)}")
                continue
        
        return {
            "status": "success",
            "message": f"Synchronisation terminée ! {successful_syncs}/{total_activities} activités synchronisées.",
            "total_activities": total_activities,
            "successful_syncs": successful_syncs
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la synchronisation: {str(e)}")
