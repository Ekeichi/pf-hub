"""
Script pour prédire le temps de course sur un parcours GPX donné.
Utilise les modèles de prédiction de vitesse et de temps.
"""

import os
from gpx_tools import parse_gpx, calculate_slope_profile
from model_elev import elev_func
from model_time_pred import predicted_time, optimize_params, time_to_minutes
from performance import get_running_records_from_csv
import numpy as np
import matplotlib.pyplot as plt


def predict_race_time(gpx_path: str, training_log_path: str) -> tuple:
    """
    Prédit le temps de course pour un parcours GPX donné en utilisant les données d'entraînement.
    
    Args:
        gpx_path (str): Chemin vers le fichier GPX du parcours
        training_log_path (str): Chemin vers le fichier CSV des activités d'entraînement
    
    Returns:
        tuple: (temps_prédit_en_minutes, distance_totale_en_mètres)
    """
    # 1. Extraire les données du parcours GPX
    points = parse_gpx(gpx_path)
    distances, slopes = calculate_slope_profile(points)
    total_distance = distances[-1]  # Distance totale en mètres

    # 2. Récupération des records de l'athlète
    records = get_running_records_from_csv(training_log_path)
    records_times = [time_to_minutes(time) for time in records.values()]
    records_distances = [float(distance.replace('m', '')) for distance in records.keys()]

    # 3. Prédiction du temps avec le modèle de puissance
    vm, tc, gamma_s, gamma_l = optimize_params(records_distances, records_times)
    result = predicted_time(total_distance, vm, tc, gamma_s, gamma_l)
    print(f"Temps en heures et minutes : {int(result//60)}h{int(result%60)}min")
    
    # 4. Entraîner le modèle de vitesse en fonction de la pente
    vitesse_plat = (vm/60)
    k1, k2 = elev_func(training_log_path, vitesse_plat=vitesse_plat)
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


    
    return result, total_distance

