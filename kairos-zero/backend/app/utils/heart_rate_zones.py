"""
Utilitaires pour le calcul des zones cardiaques.
Calcule le temps passé dans chaque zone cardiaque à partir des données de streams.
"""

import json
from typing import Dict, List, Tuple
from datetime import timedelta


def calculate_heart_rate_zones(heartrate_data: str, max_hr: int = None) -> Dict:
    """
    Calcule le temps passé dans chaque zone cardiaque.
    
    Args:
        heartrate_data: Données JSON des streams de fréquence cardiaque
        max_hr: Fréquence cardiaque maximale (si None, utilise la formule 220-âge)
        
    Returns:
        Dict avec le temps passé dans chaque zone
    """
    if not heartrate_data:
        return {
            "zones": {},
            "total_time": 0,
            "max_hr": max_hr,
            "error": "No heart rate data available"
        }
    
    try:
        # Parse les données JSON
        data = json.loads(heartrate_data)
        heartrate_values = data.get("heartrate", [])
        time_values = data.get("time", [])
        
        if not heartrate_values or not time_values:
            return {
                "zones": {},
                "total_time": 0,
                "max_hr": max_hr,
                "error": "Incomplete heart rate data"
            }
        
        # Si pas de FCMax fournie, on utilise la valeur max des données
        if not max_hr:
            max_hr = 194
        
        # Définition des zones (en % de FCMax)
        zones = {
            "zone_1": (0.5 * max_hr, 0.6 * max_hr),      # Récupération
            "zone_2": (0.6 * max_hr, 0.7 * max_hr),      # Endurance
            "zone_3": (0.7 * max_hr, 0.8 * max_hr),      # Aérobie
            "zone_4": (0.8 * max_hr, 0.9 * max_hr),      # Seuil
            "zone_5": (0.9 * max_hr, max_hr)             # Anaérobie
        }
        
        # Initialisation des compteurs
        zone_times = {zone: 0 for zone in zones.keys()}
        zone_times["below_zone_1"] = 0  # En dessous de la zone 1
        zone_times["above_zone_5"] = 0  # Au-dessus de la zone 5
        
        # Calcul du temps dans chaque zone
        for i in range(len(heartrate_values) - 1):
            hr = heartrate_values[i]
            time_diff = time_values[i + 1] - time_values[i] if i + 1 < len(time_values) else 0
            
            # Détermination de la zone
            zone_found = False
            for zone_name, (min_hr, max_hr_zone) in zones.items():
                if min_hr <= hr < max_hr_zone:
                    zone_times[zone_name] += time_diff
                    zone_found = True
                    break
            
            if not zone_found:
                if hr < zones["zone_1"][0]:
                    zone_times["below_zone_1"] += time_diff
                else:
                    zone_times["above_zone_5"] += time_diff
        
        # Conversion en minutes et formatage
        zone_summary = {}
        total_time = 0
        
        for zone, time_seconds in zone_times.items():
            time_minutes = time_seconds / 60
            total_time += time_minutes
            
            zone_summary[zone] = {
                "time_seconds": time_seconds,
                "time_minutes": round(time_minutes, 1),
                "percentage": round((time_minutes / (total_time or 1)) * 100, 1) if total_time > 0 else 0
            }
        
        return {
            "zones": zone_summary,
            "total_time_minutes": round(total_time, 1),
            "max_hr": max_hr,
            "zone_limits": {zone: (int(min_hr), int(max_hr)) for zone, (min_hr, max_hr) in zones.items()}
        }
        
    except Exception as e:
        return {
            "zones": {},
            "total_time": 0,
            "max_hr": max_hr,
            "error": f"Error calculating zones: {str(e)}"
        }


def get_zone_description(zone_name: str) -> str:
    """
    Retourne la description d'une zone cardiaque.
    """
    descriptions = {
        "zone_1": "Recovery - Regeneration and recovery",
        "zone_2": "Endurance - Basic endurance development",
        "zone_3": "Aerobic - Aerobic capacity improvement",
        "zone_4": "Threshold - Anaerobic threshold development",
        "zone_5": "Anaerobic - Maximum power development",
        "below_zone_1": "Below zone 1",
        "above_zone_5": "Above zone 5"
    }
    return descriptions.get(zone_name, "Unknown zone")


def format_zone_time(time_minutes: float) -> str:
    """
    Formate le temps en heures et minutes.
    """
    if time_minutes < 60:
        return f"{time_minutes:.1f} min"
    else:
        hours = int(time_minutes // 60)
        minutes = time_minutes % 60
        return f"{hours}h{minutes:.0f}min"


def calculate_training_load(zone_data: Dict) -> Dict:
    """
    Calcule la charge d'entraînement basée sur les zones cardiaques.
    Utilise le modèle TRIMP (Training Impulse).
    """
    if not zone_data or "zones" not in zone_data:
        return {"trimp": 0, "intensity_factor": 0}
    
    # Coefficients TRIMP pour chaque zone
    trimp_coefficients = {
        "zone_1": 1.0,
        "zone_2": 2.0,
        "zone_3": 3.0,
        "zone_4": 4.0,
        "zone_5": 5.0,
        "below_zone_1": 0.5,
        "above_zone_5": 5.5
    }
    
    total_trimp = 0
    total_time = 0
    
    for zone, data in zone_data["zones"].items():
        if zone in trimp_coefficients:
            time_hours = data["time_seconds"] / 3600
            total_trimp += time_hours * trimp_coefficients[zone]
            total_time += time_hours
    
    intensity_factor = total_trimp / total_time if total_time > 0 else 0
    
    return {
        "trimp": round(total_trimp, 1),
        "intensity_factor": round(intensity_factor, 2),
        "total_time_hours": round(total_time, 2)
    }


def calculate_effort_score(zone_data: Dict) -> float:
    """
    Calcule le score d'effort relatif basé sur les zones cardiaques.
    Utilise la formule : sum((temps_zone_en_heures) * exp(poids_zone))
    
    Args:
        zone_data: Données des zones cardiaques calculées
        
    Returns:
        float: Score d'effort relatif
    """
    if not zone_data or "zones" not in zone_data:
        return 0.0
    
    # Pondérations pour chaque zone (exponentielles pour favoriser les zones élevées)
    zone_weights = {
        "zone_1": 1.0,      # Récupération
        "zone_2": 2.0,      # Endurance
        "zone_3": 3.0,      # Aérobie
        "zone_4": 4.0,      # Seuil
        "zone_5": 5.0,      # Anaérobie
        "below_zone_1": 0.0, # En dessous zone 1 (pas d'effort)
        "above_zone_5": 6.0  # Au-dessus zone 5 (effort maximal)
    }
    
    import math
    
    effort_score = 0.0
    
    for zone, data in zone_data["zones"].items():
        if zone in zone_weights:
            time_hours = data.get("time_seconds", 0) / 3600
            weight = zone_weights[zone]
            # Calcul selon la formule : (temps_zone_en_heures) * exp(poids_zone)
            effort_score += time_hours * math.exp(weight)
    
    return round(effort_score, 2) 