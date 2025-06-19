from scipy.optimize import minimize
from scipy.special import lambertw
import numpy as np

# Fonction pour convertir un temps au format hh:mm:ss en minutes
def time_to_minutes(time_str):
    """
    Convertit un temps au format 'hh:mm:ss', 'mm:ss', ou 'ss.ms' en minutes
    """
    if isinstance(time_str, (int, float)):
        return float(time_str)
        
    parts = time_str.split(':')
    
    if len(parts) == 3:  # Format hh:mm:ss
        hours, minutes, seconds = map(float, parts)
        return hours * 60 + minutes + seconds / 60
    elif len(parts) == 2:  # Format mm:ss
        minutes, seconds = map(float, parts)
        return minutes + seconds / 60
    elif len(parts) == 1:  # Format seconds.milliseconds
        return float(parts[0]) / 60
    else:
        raise ValueError("Format de temps non reconnu. Utilisez 'hh:mm:ss', 'mm:ss' ou 'ss.ms'")

# Fonction pour convertir des minutes en format hh:mm:ss
def minutes_to_time_str(minutes):
    """
    Convertit des minutes en format 'hh:mm:ss', 'mm:ss' ou 'ss.cc'
    """
    hours = int(minutes // 60)
    mins = int(minutes % 60)
    secs = int((minutes * 60) % 60)
    centisecs = int(((minutes * 60 * 100) % 100))
    
    if hours > 0:
        return f"{hours}:{mins:02d}:{secs:02d}"
    elif mins > 0:
        return f"{mins}:{secs:02d}"
    else:
        return f"{secs}.{centisecs:02d}"

# Fonction pour calculer le temps prédit T(d) pour une distance d
def predicted_time(d, vm, tc, gamma_s, gamma_l):
    dc = vm * tc  # Distance critique
    
    if d <= dc:
        # Pour les distances courtes, utiliser une approximation directe
        T = d / (vm * (1 - gamma_s * np.log(d/dc)))
    else:
        # Pour les distances longues, utiliser une approximation directe
        T = d / (vm * (1 - gamma_l * np.log(d/dc)))
    
    return T

# Fonction d'erreur à minimiser
def error_function(params, distances, real_times):
    vm, tc, gamma_s, gamma_l = params
    predicted_times = [predicted_time(d, vm, tc, gamma_s, gamma_l) for d in distances]
    error = sum(((real - pred) / real) ** 2 for real, pred in zip(real_times, predicted_times))
    return error

def optimize_params(distances, real_times):
    initial_params = [200, 10, 0.1, 0.05]  # vm en m/min, tc en min, gamma_s, gamma_l
    result = minimize(error_function, initial_params, args=(distances, real_times), method='L-BFGS-B',
                    bounds=[(150, 250), (5, 20), (0.01, 1), (0.01, 1)])
    return result.x


