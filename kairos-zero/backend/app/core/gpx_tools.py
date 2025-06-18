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