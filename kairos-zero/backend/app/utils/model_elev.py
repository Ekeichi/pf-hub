"""
Modèle de prédiction de performance basé sur la pente.
Implémente la fonction f(pente) = vitesse pour prédire
les performances en fonction du profil du parcours.
Implémente le modèle de puissance pour le temps de course sans alea.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
import json

OUTLIER_Z_SCORE_THRESHOLD = 3
MIN_SPEED_MPS = 0.5  # 0.5 m/s = 1.8 km/h
MAX_SPEED_MPS = 10.0  # 10 m/s = 36 km/h
HEART_RATE_ZONE_MIN = 160
HEART_RATE_ZONE_MAX = 180
POLYNOMIAL_DEGREE = 2
MPS_TO_MIN_PER_KM = 16.67

def extract_arrays(row):
    try:
        # Les données peuvent être soit des chaînes JSON soit des dictionnaires Python
        elev = row["elevation_data"]
        pace = row["pace_data"]
        hr = row["heartrate_data"]
        
        # Si ce sont des chaînes JSON, les parser
        if isinstance(elev, str):
            elev = json.loads(elev)
        if isinstance(pace, str):
            pace = json.loads(pace)
        if isinstance(hr, str):
            hr = json.loads(hr)

        if not all(k in elev for k in ("distance", "altitude")): return None
        if not all(k in pace for k in ("time", "distance")): return None
        if not all(k in hr for k in ("time", "heartrate")): return None

        d_alt = np.array(elev["distance"])
        alt = np.array(elev["altitude"])
        d_pace = np.array(pace["distance"])
        t_pace = np.array(pace["time"])
        heart_rate = np.array(hr["heartrate"])

        if len(d_alt) < 2 or len(d_pace) < 2 or len(t_pace) < 2 or len(heart_rate) < 2:
            return None

        min_common = max(d_alt[0], d_pace[0])
        max_common = min(d_alt[-1], d_pace[-1])
        if max_common <= min_common:
            return None

        d_ref = np.linspace(min_common, max_common, min(len(d_alt), len(d_pace)))

        alt_ref = np.interp(d_ref, d_alt, alt)
        t_ref = np.interp(d_ref, d_pace, t_pace)
        hr_ref = np.interp(d_ref, d_pace, heart_rate)

        pente = np.gradient(alt_ref, d_ref * 1000) * 100
        vitesse = np.gradient(d_ref * 1000, t_ref)  # Vitesse en m/s

        mask = np.isfinite(pente) & np.isfinite(vitesse) & (vitesse > MIN_SPEED_MPS) & (vitesse < MAX_SPEED_MPS)
        if not np.any(mask):
            return None

        return (pente[mask], vitesse[mask], hr_ref[mask])
    except Exception as e:
        print(f"Error in extract_arrays: {e}")
        return None
    


def elev_func(df, vitesse_plat):
    df = df.dropna(subset=["elevation_data", "pace_data", "heartrate_data"])

    extracted = df.apply(extract_arrays, axis=1)
    extracted = extracted.dropna()
    
    # Vérifier qu'on a des données valides
    if len(extracted) == 0:
        print("Aucune donnée valide extraite pour le modèle d'élévation")
        return None, None

    all_pente = np.concatenate([x[0] for x in extracted]).reshape(-1, 1)
    all_vitesse = np.concatenate([x[1] for x in extracted]).reshape(-1, 1)
    all_heart_rate = np.concatenate([x[2] for x in extracted]).reshape(-1, 1)

    # Suppression des outliers
    z_p = np.abs((all_pente - np.mean(all_pente)) / np.std(all_pente))
    z_v = np.abs((all_vitesse - np.mean(all_vitesse)) / np.std(all_vitesse))
    z_h = np.abs((all_heart_rate - np.mean(all_heart_rate)) / np.std(all_heart_rate))
    mask_outliers = (z_p < OUTLIER_Z_SCORE_THRESHOLD) & (z_v < OUTLIER_Z_SCORE_THRESHOLD) & (z_h < OUTLIER_Z_SCORE_THRESHOLD)

    p = all_pente[mask_outliers]
    v = all_vitesse[mask_outliers]
    h = all_heart_rate[mask_outliers]

    # Filtre zone fréquence cardiaque
    mask_hr_zone = (h >= HEART_RATE_ZONE_MIN) & (h <= HEART_RATE_ZONE_MAX)
    p_hr = p[mask_hr_zone].reshape(-1, 1)
    v_hr = v[mask_hr_zone].reshape(-1, 1)

    mask_p_realiste = (np.abs(p_hr) <= 30)
    p_hr = p_hr[mask_p_realiste].reshape(-1, 1)
    v_hr = v_hr[mask_p_realiste].reshape(-1, 1)

    if p_hr.shape[0] < POLYNOMIAL_DEGREE + 1:
        print(f"Pas assez de données pour l'apprentissage: {p_hr.shape[0]} points")
        return None, None

    normalized_speed = v_hr / vitesse_plat

    # Regression linéaire uphill
    uphill = pd.DataFrame({'pente': p_hr.flatten(), 'vitesse': normalized_speed.flatten()})
    uphill = uphill[uphill['pente'] > 0]
    montees_valid = uphill[uphill['vitesse'] > 0]
    
    if len(montees_valid) == 0:
        print("Aucune donnée de montée valide")
        k1 = 0.1  # Valeur par défaut
    else:
        montees_valid['ln_vitesse_norm'] = np.log(montees_valid['vitesse'])
        X_montee = montees_valid[['pente']]
        y_montee = montees_valid['ln_vitesse_norm']
        reg_montee = LinearRegression().fit(X_montee, y_montee)
        k1 = -reg_montee.coef_[0]

    # Regression linéaire downhill
    downhill = pd.DataFrame({'pente': p_hr.flatten(), 'vitesse': normalized_speed.flatten()})
    downhill = downhill[downhill['pente'] < 0]
    descentes_valid = downhill[downhill['vitesse'] > 0]
    
    if len(descentes_valid) == 0:
        print("Aucune donnée de descente valide")
        k2 = 0.05  # Valeur par défaut
    else:
        descentes_valid['ln_vitesse_norm'] = np.log(descentes_valid['vitesse'])
        X_descente = descentes_valid[['pente']]
        y_descente = descentes_valid['ln_vitesse_norm']
        reg_descente = LinearRegression().fit(X_descente, y_descente)
        k2 = -reg_descente.coef_[0]

    return k1, k2




