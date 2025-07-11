"""
Outils pour la manipulation et l'analyse des fichiers GPX.
Fonctionnalités :
- Lecture et parsing des fichiers GPX
- Extraction des données de vitesse, distance, altitude
- Calcul des métriques de performance
- Nettoyage et normalisation des données
"""

import gpxpy
from typing import List
from gpxpy.gpx import GPXTrackPoint
from math import sin, cos, atan2, sqrt, radians

def parse_gpx(file_path: str) -> List[GPXTrackPoint]:
    """Lit et analyse un fichier GPX pour extraire les points de trajectoire."""
    try:
        with open(file_path, 'r') as gpx_file:
            gpx = gpxpy.parse(gpx_file)

        points = []
        for track in gpx.tracks:
            for segment in track.segments:
                for point in segment.points:
                    track_point = GPXTrackPoint(
                        latitude=point.latitude,
                        longitude=point.longitude,
                        elevation=point.elevation or 0  # Gestion des altitudes manquantes
                    )
                    points.append(track_point)

        if not points:
            raise ValueError("Aucun point trouvé dans le fichier GPX")

        return points
    except Exception as e:
        print(f"Error in parse_gpx: {e}")
        return []

def haversine_distance(point1, point2):
    """
    Calcule la distance entre deux points en utilisant la formule de Haversine
    """
    # Si les points sont des listes, extraire lat/lon
    if isinstance(point1, list):
        lat1, lon1 = point1[0], point1[1]
    else:
        lat1, lon1 = point1.latitude, point1.longitude
        
    if isinstance(point2, list):
        lat2, lon2 = point2[0], point2[1]
    else:
        lat2, lon2 = point2.latitude, point2.longitude
    
    # Convertir en radians
    lat1, lon1 = radians(lat1), radians(lon1)
    lat2, lon2 = radians(lat2), radians(lon2)
    
    # Rayon de la Terre en mètres
    R = 6371000
    
    # Différences de latitude et longitude
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    # Formule de Haversine
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    # Distance en mètres
    distance = R * c
    
    return distance

def calculate_slope_profile(points: List[GPXTrackPoint]) -> tuple:
    """Calcule le profil de pente et les distances cumulées"""
    distances = [0.0]
    slopes = []

    for i in range(len(points)-1):
        dist = haversine_distance(points[i], points[i+1])
        elevation_change = points[i+1].elevation - points[i].elevation
        slope = (elevation_change / dist) * 100 if dist > 0 else 0

        distances.append(distances[-1] + dist)
        slopes.append(slope)

    return distances, slopes

def calculate_elevation_gain(
    points: List[GPXTrackPoint],
    min_distance: float = 50.0,
    min_elevation_gain: float = 2.0  # seuil vertical optionnel
) -> float:
    """
    Calcule le dénivelé positif de manière robuste.

    Args:
        points: Liste des points GPX
        min_distance: Distance minimale entre points (mètres)
        min_elevation_gain: Gain minimal en élévation pour être compté (mètres)

    Returns:
        float: Dénivelé positif en mètres
    """
    if not points or len(points) < 2:
        return 0.0

    elevation_gain = 0.0
    cumulative_distance = 0.0
    last_valid_point = points[0]

    for i in range(1, len(points)):
        current_point = points[i]
        
        # Vérifie que les altitudes existent
        if current_point.elevation is None or last_valid_point.elevation is None:
            continue

        distance = haversine_distance(last_valid_point, current_point)
        cumulative_distance += distance

        if cumulative_distance >= min_distance:
            elevation_diff = current_point.elevation - last_valid_point.elevation
            if elevation_diff >= min_elevation_gain:
                elevation_gain += elevation_diff

            # Réinitialise les compteurs
            last_valid_point = current_point
            cumulative_distance = 0.0

    # Dernier segment éventuel
    if cumulative_distance > 0:
        last_diff = points[-1].elevation - last_valid_point.elevation
        if last_diff >= min_elevation_gain:
            elevation_gain += last_diff

    return elevation_gain

def calculate_elevation_gain_smoothed(points: List[GPXTrackPoint], min_distance: float = 100.0, smoothing_factor: float = 0.1) -> float:
    """
    Calcule le dénivelé positif avec lissage pour éliminer le bruit.
    
    Args:
        points: Liste des points GPX
        min_distance: Distance minimale entre points (en mètres)
        smoothing_factor: Facteur de lissage (0.1 = très lissé, 1.0 = pas de lissage)
    
    Returns:
        float: Dénivelé positif en mètres
    """
    if not points or len(points) < 3:
        return 0.0
    
    # Lissage des altitudes avec une moyenne mobile
    smoothed_elevations = []
    for i in range(len(points)):
        if i == 0:
            smoothed_elevations.append(points[i].elevation)
        elif i == len(points) - 1:
            smoothed_elevations.append(points[i].elevation)
        else:
            # Moyenne pondérée des 3 points
            prev_elev = points[i-1].elevation
            curr_elev = points[i].elevation
            next_elev = points[i+1].elevation
            
            smoothed = (prev_elev * smoothing_factor + curr_elev * (1 - 2*smoothing_factor) + next_elev * smoothing_factor)
            smoothed_elevations.append(smoothed)
    
    # Créer de nouveaux points avec les altitudes lissées
    smoothed_points = []
    for i, point in enumerate(points):
        smoothed_point = GPXTrackPoint(
            latitude=point.latitude,
            longitude=point.longitude,
            elevation=smoothed_elevations[i]
        )
        smoothed_points.append(smoothed_point)
    
    # Calculer le dénivelé avec les points lissés
    return calculate_elevation_gain(smoothed_points, min_distance)

def calculate_elevation_stats(points: List[GPXTrackPoint]) -> dict:
    """
    Calcule les statistiques d'élévation complètes.
    
    Returns:
        dict: Dictionnaire avec elevation_gain, elevation_loss, min_elevation, max_elevation
    """
    if not points:
        return {
            'elevation_gain': 0.0,
            'elevation_loss': 0.0,
            'min_elevation': 0.0,
            'max_elevation': 0.0,
            'total_elevation_change': 0.0
        }
    
    elevations = [point.elevation for point in points]
    min_elevation = min(elevations)
    max_elevation = max(elevations)
    
    elevation_gain = calculate_elevation_gain(points)
    
    # Calculer le dénivelé négatif (descentes)
    elevation_loss = 0.0
    cumulative_distance = 0.0
    last_point = points[0]
    
    for i in range(1, len(points)):
        current_point = points[i]
        distance = haversine_distance(last_point, current_point)
        cumulative_distance += distance
        
        if cumulative_distance >= 10.0:  # 10m minimum
            elevation_diff = current_point.elevation - last_point.elevation
            
            if elevation_diff < 0:  # Descente
                elevation_loss += abs(elevation_diff)
            
            last_point = current_point
            cumulative_distance = 0.0
    
    # Dernier segment
    if cumulative_distance > 0:
        elevation_diff = points[-1].elevation - last_point.elevation
        if elevation_diff < 0:
            elevation_loss += abs(elevation_diff)
    
    return {
        'elevation_gain': elevation_gain,
        'elevation_loss': elevation_loss,
        'min_elevation': min_elevation,
        'max_elevation': max_elevation,
        'total_elevation_change': max_elevation - min_elevation
    }