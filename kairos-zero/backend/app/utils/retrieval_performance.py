import csv
import json
from typing import Dict
from pathlib import Path
import sys
import re
from app.models.strava_activity import StravaActivity
from sqlalchemy.orm import Session


def convert_distance_to_meters(distance_str: str) -> int:
    # Ex: "5k" -> 5000, "1 mile" -> 1609, "1000m" -> 1000
    distance_str = distance_str.lower().strip()
    if 'k' in distance_str:
        return int(float(distance_str.replace('k', '')) * 1000)
    if 'mile' in distance_str:
        return int(float(distance_str.replace('mile', '').strip()) * 1609)
    if distance_str.endswith('m'):
        return int(distance_str.replace('m', ''))
    return 0

def format_time(seconds: int) -> str:
    minutes = seconds // 60
    sec = seconds % 60
    return f"{minutes}:{sec:02d}"

def time_str_to_seconds(time_str: str) -> int:
    parts = time_str.split(':')
    if len(parts) == 2:
        return int(parts[0]) * 60 + int(parts[1])
    elif len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
    return 0

def convert_distance_to_meters(distance_str: str) -> int:
    """
    Convertit une distance en mètres
    Args:
        distance_str (str): Distance sous forme de chaîne (ex: "5km", "10k", "800m")
    Returns:
        int: Distance en mètres
    """
    # Extraction du nombre et de l'unité
    match = re.match(r'(\d+(?:\.\d+)?)\s*([a-zA-Z]+)', distance_str)
    if not match:
        return 0
    
    number = float(match.group(1))
    unit = match.group(2).lower()
    
    # Conversion en mètres
    if unit in ['km', 'k']:
        return int(number * 1000)
    elif unit in ['m', 'meter', 'meters']:
        return int(number)
    elif unit in ['mi', 'mile', 'miles']:
        return int(number * 1609.34)
    return 0

def format_time(seconds: float) -> str:
    """
    Convertit un temps en secondes en format mm:ss ou hh:mm:ss
    Args:
        seconds (float): Temps en secondes
    Returns:
        str: Temps formaté
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    return f"{minutes:02d}:{seconds:02d}"

def get_running_records_from_csv(csv_path: str) -> Dict[str, str]:
    """
    Extrait les records de course pour chaque distance à partir de la dernière colonne (best_efforts) du fichier CSV.
    Args:
        csv_path (str): Chemin vers le fichier CSV des activités
    Returns:
        Dict[str, str]: Dictionnaire contenant les records pour chaque distance en mètres (distance: temps formaté)
    """
    csv.field_size_limit(sys.maxsize)
    records = {}
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            if not row:
                continue
            best_efforts_str = row[-1]
            try:
                best_efforts = json.loads(best_efforts_str)
                for effort in best_efforts:
                    distance = effort.get('name')
                    if distance:
                        distance_m = convert_distance_to_meters(distance)
                        if distance_m > 0:
                            elapsed_time = effort.get('elapsed_time')
                            distance_key = f"{distance_m}m"
                            if distance_key not in records or elapsed_time < float(records[distance_key].replace(':', '')):
                                records[distance_key] = format_time(elapsed_time)
            except Exception:
                continue
    return records

from typing import Dict
from sqlalchemy.orm import Session
from app.models.strava_activity import StravaActivity
import json


def get_running_records_from_db(db: Session, athlete_id: int) -> Dict[str, str]:
    """
    Extrait les meilleurs temps (best efforts) pour un athlète donné à partir de la base de données.

    Args:
        db (Session): Session SQLAlchemy
        athlete_id (int): ID de l'athlète

    Returns:
        Dict[str, str]: Dictionnaire {distance_en_mètres: temps_formatté}
    """
    records = {}
    
    print(f"Recherche des records pour l'athlète {athlete_id}")
    
    activities = db.query(StravaActivity).filter_by(athlete_id=athlete_id).all()
    print(f"Nombre d'activités trouvées: {len(activities)}")

    for activity in activities:
        print(f"Activité {activity.id}: best_efforts = {activity.best_efforts[:100] if activity.best_efforts else 'None'}...")
        
        if not activity.best_efforts:
            print(f"  -> Pas de best_efforts, on passe")
            continue

        try:
            best_efforts = json.loads(activity.best_efforts)
            print(f"  -> {len(best_efforts)} best_efforts parsés")
            
            for effort in best_efforts:
                name = effort.get("name")
                elapsed_time = effort.get("elapsed_time")
                
                print(f"    Effort: {name} en {elapsed_time}s")

                if not name or elapsed_time is None:
                    print(f"      -> Nom ou temps manquant, on passe")
                    continue

                distance_m = convert_distance_to_meters(name)
                print(f"      -> Distance convertie: {distance_m}m")
                
                if distance_m <= 0:
                    print(f"      -> Distance invalide, on passe")
                    continue

                key = f"{distance_m}m"
                current_best = records.get(key)
                
                formatted_time = format_time(elapsed_time)
                print(f"      -> Temps formaté: {formatted_time}")

                if current_best is None or elapsed_time < time_str_to_seconds(current_best):
                    records[key] = formatted_time
                    print(f"      -> NOUVEAU RECORD pour {key}: {formatted_time}")
                else:
                    print(f"      -> Pas un record (actuel: {current_best})")

        except json.JSONDecodeError as e:
            print(f"  -> Erreur JSON: {e}")
            continue
        except Exception as e:
            print(f"  -> Erreur inattendue: {e}")
            continue

    print(f"Records finaux trouvés: {records}")
    return records