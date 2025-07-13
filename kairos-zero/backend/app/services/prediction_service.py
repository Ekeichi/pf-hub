"""
Service d'orchestration pour les prédictions de performance.
Coordonne le flux de travail complet :
1. Récupération des données d'entraînement
2. Analyse des performances récentes
3. Calcul des zones d'allure
4. Génération des prédictions
"""

"""
Script pour prédire le temps de course sur un parcours GPX donné.
Utilise les modèles de prédiction de vitesse et de temps.
"""

import os
import json
from app.utils.gpx_tools import parse_gpx, calculate_slope_profile
from app.utils.model_elev import elev_func
from app.utils.model_time_pred import predicted_time, optimize_params, time_to_minutes
from app.utils.retrieval_performance import get_running_records_from_csv
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sqlalchemy.orm import Session
from app.utils.retrieval_performance import get_running_records_from_db
from app.repositories.strava_activity import get_activities_for_prediction


def predict_race_time(gpx_path: str, db: Session, athlete_id: int) -> tuple:
    """
    Prédit le temps de course pour un parcours GPX donné en utilisant les données d'entraînement.
    
    Args:
        gpx_path (str): Chemin vers le fichier GPX du parcours
        db (Session): Session de base de données
        athlete_id (int): ID de l'athlète
    
    Returns:
        tuple: (temps_prédit_en_minutes, distance_totale_en_mètres)
    """
    print(f"=== DÉBUT PRÉDICTION ===")
    print(f"Athlete ID: {athlete_id}")
    print(f"Fichier GPX: {gpx_path}")
    
    # 1. Extraire les données du parcours GPX
    points = parse_gpx(gpx_path)
    if not points:
        raise ValueError("Impossible de parser le fichier GPX")
        
    distances, slopes = calculate_slope_profile(points)
    total_distance = distances[-1]  # Distance totale en mètres
    print(f"Distance totale: {total_distance/1000:.2f} km")

    # 2. Récupération des records de l'athlète
    print(f"Recherche des records pour athlete_id={athlete_id}...")
    records = get_running_records_from_db(db, athlete_id)
    
    # Vérifier si on a des records
    if not records:
        # Si pas de records, utiliser des valeurs par défaut
        print("Aucun record trouvé, utilisation de valeurs par défaut")
        result = total_distance / 1000 * 5  # 5 min/km par défaut
        return result, total_distance
    
    records_times = [time_to_minutes(time) for time in records.values()]
    records_distances = [float(distance.replace('m', '')) for distance in records.keys()]

    # 3. Prédiction du temps avec le modèle de puissance
    vm, tc, gamma_s, gamma_l = optimize_params(records_distances, records_times)
    result = predicted_time(total_distance, vm, tc, gamma_s, gamma_l)
    print(f"Temps en heures et minutes : {int(result//60)}h{int(result%60)}min")
    
    # 4. Entraîner le modèle de vitesse en fonction de la pente
    vitesse_plat = (vm/60)
    
    activities = get_activities_for_prediction(db, athlete_id)
    print(f"Nombre d'activités trouvées: {len(activities) if activities else 0}")

    # Vérifier si on a des activités avec des données détaillées
    if not activities:
        print("No activity found, using base model")
        return result, total_distance

    # Préparer les données pour le modèle d'élévation
    activity_data = []
    for a in activities:
        # Parser les données JSON si elles existent
        elevation_data = None
        pace_data = None
        heartrate_data = None
        
        if a.elevation_data:
            try:
                elevation_data = json.loads(a.elevation_data)
                print(f"Activité {a.id}: elevation_data OK")
            except (json.JSONDecodeError, TypeError):
                elevation_data = None
                print(f"Activité {a.id}: elevation_data invalide")
                
        if a.pace_data:
            try:
                pace_data = json.loads(a.pace_data)
                print(f"Activité {a.id}: pace_data OK")
            except (json.JSONDecodeError, TypeError):
                pace_data = None
                print(f"Activité {a.id}: pace_data invalide")
                
        if a.heartrate_data:
            try:
                heartrate_data = json.loads(a.heartrate_data)
            except (json.JSONDecodeError, TypeError):
                heartrate_data = None
        
        activity_data.append({
            "elevation_data": elevation_data,
            "pace_data": pace_data,
            "heartrate_data": heartrate_data
        })

    # Filtrer les activités qui ont des données valides
    valid_activities = [a for a in activity_data if a["elevation_data"] is not None and a["pace_data"] is not None]
    print(f"Activités avec données valides: {len(valid_activities)}")
    
    if not valid_activities:
        print("Aucune activité avec des données détaillées, utilisation du modèle de base")
        return result, total_distance

    df = pd.DataFrame(valid_activities)
    print(f"DataFrame créé avec {len(df)} activités")

    try:
        print("Tentative d'appel à elev_func...")
        k1, k2 = elev_func(df, vitesse_plat=vitesse_plat)
        
        if k1 is None or k2 is None:
            print("elev_func a retourné None, utilisation de valeurs par défaut")
            k1, k2 = 0.1, 0.05  # Valeurs par défaut
        
        print(f'k1 = {k1:.3f}, k2 = {k2:.3f}')

        alpha = 0.05 # coefficient de fatigue
        beta = 0.8 # vitesse minimale

        # 5. Calculer le temps total en tenant compte de la pente
        time_total = 0.0
        distance_total = 0.0

        for i in range(1, len(distances)):
            segment_length = distances[i] - distances[i-1]
            slope = slopes[i-1]
            
            distance_total += segment_length
            vitesse_fatigue = (vm / 60) * max(1 - alpha * distance_total, beta)
            
            if slope >= 0:
                v_segment = vitesse_fatigue * np.exp(-k1 * slope)
            else:
                v_segment = vitesse_fatigue * (1 + k2 * slope)
            
            v_segment = max(v_segment, 0.1)
            t_segment = segment_length / v_segment
            time_total += t_segment

        time_hours = int(time_total // 3600)
        time_minutes = int((time_total % 3600) // 60)

        print(f"Temps total corrigé dénivelé : {time_hours}h{time_minutes}min")
        print(f"Temps de base (sans dénivelé): {int(result//60)}h{int(result%60)}min")
        print(f"Différence: {time_total/60 - result:.1f} minutes")
        
        # Retourner le temps corrigé en minutes
        return time_total / 60, total_distance
        
    except Exception as e:
        print(f"Erreur dans le calcul avec dénivelé: {e}")
        print(f"Type d'erreur: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        # En cas d'erreur, retourner le résultat de base
        return result, total_distance

