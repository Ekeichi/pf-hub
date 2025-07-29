"""
Machine Learning Effort Classification for Running Performance Analysis
Replaces simple HR zone filtering with intelligent effort level detection
"""

import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LinearRegression
import json
# from app.repositories.strava_activity import get_activities_for_prediction

# Constants
MIN_SPEED_MPS = 0.5  # 0.5 m/s = 1.8 km/h
MAX_SPEED_MPS = 10.0  # 10 m/s = 36 km/h
OUTLIER_Z_SCORE_THRESHOLD = 3

def extract_arrays_enhanced(row):
    """Enhanced version of extract_arrays with additional features"""
    try:
        elev = row["elevation_data"]
        pace = row["pace_data"]
        hr = row["heartrate_data"]
        
        if isinstance(elev, str):
            elev = json.loads(elev)
        if isinstance(pace, str):
            pace = json.loads(pace)
        if isinstance(hr, str):
            hr = json.loads(hr)

        if not all(k in elev for k in ("distance", "altitude")): return None
        if not all(k in pace for k in ("time", "distance")): return None
        if hr is None or not all(k in hr for k in ("time", "heartrate")): return None

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
        
        # Calculate additional features for ML
        duration_into_run = t_ref - t_ref[0]  # Time elapsed
        hr_smoothed = np.convolve(hr_ref, np.ones(5)/5, mode='same')  # Smoothed HR
        pace_variability = np.abs(np.gradient(vitesse))  # Pace variability
        
        mask = (np.isfinite(pente) & np.isfinite(vitesse) & 
                (vitesse > MIN_SPEED_MPS) & (vitesse < MAX_SPEED_MPS) &
                np.isfinite(hr_ref))
        
        if not np.any(mask):
            return None

        return {
            'pente': pente[mask],
            'vitesse': vitesse[mask],
            'hr': hr_ref[mask],
            'hr_smoothed': hr_smoothed[mask],
            'duration_into_run': duration_into_run[mask],
            'pace_variability': pace_variability[mask],
            'distance': d_ref[mask]
        }
    except Exception as e:
        print(f"Error in extract_arrays_enhanced: {e}")
        return None

def calculate_effort_features(data_dict):
    """Calculate features for effort classification"""
    pente = data_dict['pente']
    vitesse = data_dict['vitesse']
    hr = data_dict['hr']
    hr_smoothed = data_dict['hr_smoothed']
    duration_into_run = data_dict['duration_into_run']
    pace_variability = data_dict['pace_variability']
    
    # Feature 1: Grade Adjusted Pace (GAP)
    # Approximation: for every 1% grade, pace increases by ~3.3%
    gap = vitesse / (1 + pente/100 * 0.033)
    
    # Feature 2: Heart Rate Efficiency (HR per unit speed)
    hr_efficiency = np.where(vitesse > 0, hr / vitesse, 0)
    
    # Feature 3: Cardiac Drift Corrected HR
    # Assume 0.5 bpm increase per minute due to drift
    hr_drift_corrected = hr - (0.5 * duration_into_run / 60)
    
    # Feature 4: Effort Score (combines HR and pace)
    effort_score = np.where(gap > 0, hr_drift_corrected / gap, 0)
    
    # Feature 5: Relative Heart Rate (assuming max HR around 190)
    hr_relative = hr / 190  # You might want to personalize this
    
    # Feature 6: Power Estimate (simplified running power model)
    # Power = weight * speed * (grade_factor + kinetic_factor)
    weight = 70  # kg, should be personalized
    power_estimate = weight * vitesse * (1 + pente/100 * 9.81 + 0.2)
    
    # Feature 7: Heart Rate Variability (local)
    hr_variability = np.abs(hr - hr_smoothed)
    
    # Feature 8: Metabolic load (combines multiple factors)
    metabolic_load = hr_relative * gap * (1 + np.abs(pente)/10)
    
    return np.column_stack([
        gap,                    # Grade adjusted pace
        hr_efficiency,          # HR efficiency
        hr_drift_corrected,     # Drift corrected HR
        effort_score,           # Combined effort score
        hr_relative,            # Relative HR
        power_estimate,         # Power estimate
        hr_variability,         # HR variability
        metabolic_load,         # Metabolic load
        pace_variability        # Pace variability
    ])

class EffortClassifier:
    def __init__(self, n_clusters=5, method='gmm'):
        """
        Initialize effort classifier
        
        Args:
            n_clusters: Number of effort levels (typically 3-7)
            method: 'kmeans', 'gmm' (Gaussian Mixture Model), or 'auto'
        """
        self.n_clusters = n_clusters
        self.method = method
        self.scaler = StandardScaler()
        self.model = None
        self.feature_names = [
            'Grade Adjusted Pace', 'HR Efficiency', 'HR Drift Corrected',
            'Effort Score', 'Relative HR', 'Power Estimate',
            'HR Variability', 'Metabolic Load', 'Pace Variability'
        ]
        
    def find_optimal_clusters(self, features, max_clusters=10):
        """Find optimal number of clusters using silhouette score"""
        print(f"🔍 Test de {max_clusters} nombres de clusters différents...")
        scores = []
        cluster_range = range(2, min(max_clusters + 1, len(features) // 50 + 1))
        
        for i, n in enumerate(cluster_range):
            print(f"📊 Test avec {n} clusters ({i+1}/{len(cluster_range)})...")
            if self.method == 'gmm':
                model = GaussianMixture(n_components=n, random_state=42)
            else:
                model = KMeans(n_clusters=n, random_state=42, n_init=10)
            
            labels = model.fit_predict(features)
            score = silhouette_score(features, labels)
            scores.append(score)
            print(f"   Score de silhouette: {score:.4f}")
            
        optimal_clusters = cluster_range[np.argmax(scores)]
        print(f"✅ Nombre optimal de clusters trouvé: {optimal_clusters} (score: {max(scores):.4f})")
        return optimal_clusters, scores
    
    def fit(self, df):
        """Fit the effort classifier on training data"""
        print("🔍 Extraction des caractéristiques des données de course...")
        
        # Extract data from all runs
        print("📊 Extraction des données de toutes les courses...")
        extracted = df.apply(extract_arrays_enhanced, axis=1)
        extracted = extracted.dropna()
        
        if len(extracted) == 0:
            raise ValueError("No valid data extracted")
        
        print(f"✅ Données extraites de {len(extracted)} courses")
        
        # Combine all features
        print("🔧 Combinaison de toutes les caractéristiques...")
        all_features = []
        all_metadata = []
        
        for i, data_dict in enumerate(extracted):
            if data_dict is None:
                continue
                
            if i % 10 == 0:  # Log tous les 10 éléments
                print(f"📈 Traitement de la course {i+1}/{len(extracted)}...")
                
            features = calculate_effort_features(data_dict)
            
            # Remove any invalid features
            valid_mask = np.all(np.isfinite(features), axis=1)
            features_clean = features[valid_mask]
            
            if len(features_clean) > 0:
                all_features.append(features_clean)
                
                # Store metadata for each point
                metadata = np.column_stack([
                    np.full(len(features_clean), i),  # Run index
                    data_dict['pente'][valid_mask],
                    data_dict['vitesse'][valid_mask],
                    data_dict['hr'][valid_mask]
                ])
                all_metadata.append(metadata)
        
        if not all_features:
            raise ValueError("No valid features extracted")
        
        print("📊 Combinaison des caractéristiques...")
        # Combine all features
        features_combined = np.vstack(all_features)
        metadata_combined = np.vstack(all_metadata)
        
        print(f"📈 Total de points de données: {len(features_combined)}")
        
        # Remove outliers
        print("🧹 Suppression des valeurs aberrantes...")
        z_scores = np.abs((features_combined - np.mean(features_combined, axis=0)) / 
                         np.std(features_combined, axis=0))
        outlier_mask = np.all(z_scores < OUTLIER_Z_SCORE_THRESHOLD, axis=1)
        
        features_clean = features_combined[outlier_mask]
        self.metadata = metadata_combined[outlier_mask]
        
        print(f"✅ Après suppression des valeurs aberrantes: {len(features_clean)} points de données")
        
        # Scale features
        print("📏 Normalisation des caractéristiques...")
        features_scaled = self.scaler.fit_transform(features_clean)
        
        # Optimisation : échantillonnage pour accélérer le clustering
        print("⚡ Optimisation : échantillonnage des données pour accélérer le clustering...")
        sample_size = min(10000, len(features_scaled))  # Max 10k points
        if len(features_scaled) > sample_size:
            indices = np.random.choice(len(features_scaled), sample_size, replace=False)
            features_sample = features_scaled[indices]
            print(f"📊 Échantillon de {sample_size} points (sur {len(features_scaled)})")
        else:
            features_sample = features_scaled
            print(f"📊 Utilisation de tous les {len(features_scaled)} points")
        
        # Nombre fixe de clusters pour éviter la recherche optimale
        if self.method == 'auto':
            print("🎯 Utilisation d'un nombre fixe de clusters (5) pour accélérer...")
            self.n_clusters = 5
            print(f"✅ Nombre de clusters fixé à: {self.n_clusters}")
        
        # Fit the clustering model (utilise K-means qui est plus rapide)
        print(f"🤖 Entraînement du modèle de clustering (K-means)...")
        self.model = KMeans(
            n_clusters=self.n_clusters, 
            random_state=42, 
            n_init=10
        )
        
        print("🎯 Prédiction des labels...")
        # Entraîner sur l'échantillon
        self.labels_sample = self.model.fit_predict(features_sample)
        
        # Prédire les labels pour toutes les données
        print("🎯 Prédiction des labels pour toutes les données...")
        self.labels = self.model.predict(features_scaled)
        self.features_scaled = features_scaled
        
        # Calculate effort level statistics
        print("📊 Calcul des statistiques par niveau d'effort...")
        self._calculate_effort_stats()
        
        print(f"✅ Classification d'effort terminée!")
        print(f"📈 Distribution des niveaux d'effort: {np.bincount(self.labels)}")
        
        return self
    
    def _calculate_effort_stats(self):
        """Calculate statistics for each effort level"""
        self.effort_stats = {}
        
        for level in range(self.n_clusters):
            mask = self.labels == level
            level_metadata = self.metadata[mask]
            level_features = self.features_scaled[mask]
            
            self.effort_stats[level] = {
                'count': np.sum(mask),
                'avg_hr': np.mean(level_metadata[:, 3]),  # HR is column 3
                'avg_speed': np.mean(level_metadata[:, 2]),  # Speed is column 2
                'avg_slope': np.mean(level_metadata[:, 1]),  # Slope is column 1
                'feature_means': np.mean(level_features, axis=0)
            }
    
    def predict_effort_level(self, data_dict):
        """Predict effort level for new data"""
        features = calculate_effort_features(data_dict)
        features_scaled = self.scaler.transform(features)
        return self.model.predict(features_scaled)
    
    def get_target_effort_data(self, target_effort_level=None):
        """Get data for a specific effort level for slope-speed modeling"""
        if target_effort_level is None:
            # Choose the effort level with most data points
            counts = [self.effort_stats[i]['count'] for i in range(self.n_clusters)]
            target_effort_level = np.argmax(counts)
        
        mask = self.labels == target_effort_level
        target_metadata = self.metadata[mask]
        
        pente = target_metadata[:, 1]  # Slope
        vitesse = target_metadata[:, 2]  # Speed
        hr = target_metadata[:, 3]  # Heart rate
        
        print(f"Selected effort level {target_effort_level}")
        print(f"Data points: {len(pente)}")
        print(f"Avg HR: {np.mean(hr):.1f} bpm")
        print(f"Avg Speed: {np.mean(vitesse):.2f} m/s")
        
        return pente, vitesse, hr, target_effort_level
    
    def plot_effort_analysis(self):
        """Plot effort level analysis"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Plot 1: PCA visualization of effort levels
        if self.features_scaled.shape[1] > 2:
            pca = PCA(n_components=2)
            features_pca = pca.fit_transform(self.features_scaled)
            
            scatter = axes[0, 0].scatter(features_pca[:, 0], features_pca[:, 1], 
                                       c=self.labels, cmap='viridis', alpha=0.6)
            axes[0, 0].set_title('Effort Levels (PCA Visualization)')
            axes[0, 0].set_xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.1%} variance)')
            axes[0, 0].set_ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.1%} variance)')
            plt.colorbar(scatter, ax=axes[0, 0])
        
        # Plot 2: HR vs Speed by effort level
        for level in range(self.n_clusters):
            mask = self.labels == level
            level_metadata = self.metadata[mask]
            axes[0, 1].scatter(level_metadata[:, 2], level_metadata[:, 3], 
                             label=f'Effort {level}', alpha=0.6)
        
        axes[0, 1].set_xlabel('Speed (m/s)')
        axes[0, 1].set_ylabel('Heart Rate (bpm)')
        axes[0, 1].set_title('Heart Rate vs Speed by Effort Level')
        axes[0, 1].legend()
        
        # Plot 3: Slope vs Speed by effort level
        for level in range(self.n_clusters):
            mask = self.labels == level
            level_metadata = self.metadata[mask]
            axes[1, 0].scatter(level_metadata[:, 1], level_metadata[:, 2], 
                             label=f'Effort {level}', alpha=0.6)
        
        axes[1, 0].set_xlabel('Slope (%)')
        axes[1, 0].set_ylabel('Speed (m/s)')
        axes[1, 0].set_title('Speed vs Slope by Effort Level')
        axes[1, 0].legend()
        
        # Plot 4: Effort level statistics
        levels = list(range(self.n_clusters))
        avg_hrs = [self.effort_stats[i]['avg_hr'] for i in levels]
        counts = [self.effort_stats[i]['count'] for i in levels]
        
        bars = axes[1, 1].bar(levels, avg_hrs, alpha=0.7)
        axes[1, 1].set_xlabel('Effort Level')
        axes[1, 1].set_ylabel('Average Heart Rate (bpm)')
        axes[1, 1].set_title('Average HR by Effort Level')
        
        # Add count labels on bars
        for bar, count in zip(bars, counts):
            height = bar.get_height()
            axes[1, 1].text(bar.get_x() + bar.get_width()/2., height,
                           f'n={count}', ha='center', va='bottom')
        
        plt.tight_layout()
        plt.show()

def elev_func_ml(df, vitesse_plat, target_effort=None):
    """
    Enhanced elevation function using ML effort classification
    """
    print("🚀 Début de elev_func_ml...")
    print(f"📊 Données d'entrée: {len(df)} activités")
    
    # Initialize and fit effort classifier
    print("🔧 Initialisation du classifieur d'effort...")
    classifier = EffortClassifier(n_clusters=5, method='auto')
    
    print("🎯 Entraînement du classifieur d'effort...")
    classifier.fit(df)
    print("✅ Classifieur d'effort entraîné avec succès!")
    
    # Get data for target effort level
    print("📈 Récupération des données pour le niveau d'effort cible...")
    pente, vitesse, hr, effort_level = classifier.get_target_effort_data(target_effort)
    print(f"📊 Données récupérées: {len(pente)} points de données")
    
    # Convert to arrays and normalize
    print("🔄 Conversion en arrays et normalisation...")
    p_hr = pente.reshape(-1, 1)
    v_hr = vitesse.reshape(-1, 1)
    
    # Filter realistic slopes
    print("🔍 Filtrage des pentes réalistes...")
    mask_p_realiste = (np.abs(p_hr) <= 30)
    p_hr = p_hr[mask_p_realiste].reshape(-1, 1)
    v_hr = v_hr[mask_p_realiste].reshape(-1, 1)
    print(f"📊 Après filtrage des pentes: {len(p_hr)} points")
    
    if len(p_hr) < 3:
        print(f"❌ Pas assez de données pour l'apprentissage: {len(p_hr)} points")
        return None, None, classifier
    
    print("📏 Normalisation de la vitesse...")
    normalized_speed = v_hr / vitesse_plat
    
    # Uphill regression
    print("⛰️ Régression pour les montées...")
    uphill = pd.DataFrame({'pente': p_hr.flatten(), 'vitesse': normalized_speed.flatten()})
    uphill = uphill[uphill['pente'] > 0]
    montees_valid = uphill[uphill['vitesse'] > 0]
    print(f"📊 Données de montée valides: {len(montees_valid)} points")
    
    if len(montees_valid) == 0:
        print("⚠️ Aucune donnée de montée valide")
        k1 = 0.1
    else:
        # Filter out zero or negative speeds before taking log
        montees_valid = montees_valid[montees_valid['vitesse'] > 0]
        if len(montees_valid) > 0:
            print("📈 Calcul du coefficient de montée...")
            montees_valid['ln_vitesse_norm'] = np.log(montees_valid['vitesse'])
            X_montee = montees_valid[['pente']]
            y_montee = montees_valid['ln_vitesse_norm']
            reg_montee = LinearRegression().fit(X_montee, y_montee)
            k1 = -reg_montee.coef_[0]
            print(f"✅ Coefficient de montée calculé: k1 = {k1:.4f}")
        else:
            k1 = 0.1
            print("⚠️ Utilisation de la valeur par défaut pour k1")
    
    # Downhill regression
    print("🏔️ Régression pour les descentes...")
    downhill = pd.DataFrame({'pente': p_hr.flatten(), 'vitesse': normalized_speed.flatten()})
    downhill = downhill[downhill['pente'] < 0]
    descentes_valid = downhill[downhill['vitesse'] > 0]
    print(f"📊 Données de descente valides: {len(descentes_valid)} points")
    
    if len(descentes_valid) == 0:
        print("⚠️ Aucune donnée de descente valide")
        k2 = 0.05
    else:
        # Filter out zero or negative speeds before taking log
        descentes_valid = descentes_valid[descentes_valid['vitesse'] > 0]
        if len(descentes_valid) > 0:
            print("📉 Calcul du coefficient de descente...")
            descentes_valid['ln_vitesse_norm'] = np.log(descentes_valid['vitesse'])
            X_descente = descentes_valid[['pente']]
            y_descente = descentes_valid['ln_vitesse_norm']
            reg_descente = LinearRegression().fit(X_descente, y_descente)
            k2 = -reg_descente.coef_[0]
            print(f"✅ Coefficient de descente calculé: k2 = {k2:.4f}")
        else:
            k2 = 0.05
            print("⚠️ Utilisation de la valeur par défaut pour k2")
    
    print(f"🎯 Coefficients finaux - Montée (k1): {k1:.4f}, Descente (k2): {k2:.4f}")
    print("✅ elev_func_ml terminé avec succès!")
    
    return k1, k2, classifier

# Example usage:
"""
# Load your data
df = pd.read_csv('your_running_data.csv')

# Apply ML-based effort classification
k1, k2, classifier = elev_func_ml(df, vitesse_plat=3.5)

# Visualize the effort analysis
classifier.plot_effort_analysis()

# Get coefficients for slope-speed relationship
print(f"Uphill impact: {k1}")
print(f"Downhill impact: {k2}")
"""

def process_activities_for_prediction(activities, db, athlete_id):
    """Process activities for elevation prediction"""
    # Prepare data for elevation model
    activity_data = []
    for a in activities:
        # Parse JSON if it exists
        elevation_data = None
        pace_data = None
        heartrate_data = None
            
        if a.elevation_data:
            try:
                elevation_data = json.loads(a.elevation_data)
                print(f"Activity {a.id}: elevation_data OK")
            except (json.JSONDecodeError, TypeError):
                elevation_data = None
                print(f"Activity {a.id}: elevation_data invalide")
                    
        if a.pace_data:
            try:
                pace_data = json.loads(a.pace_data)
                print(f"Activity {a.id}: pace_data OK")
            except (json.JSONDecodeError, TypeError):
                pace_data = None
                print(f"Activity {a.id}: pace_data invalide")
                    
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

    # Filter activities with valid data
    valid_activities = [a for a in activity_data if a["elevation_data"] is not None and a["pace_data"] is not None]
    print(f"Activities with valid data: {len(valid_activities)}")
    
    if not valid_activities:
        print("No activity with detailed data, using base model")
        return None, None

    df = pd.DataFrame(valid_activities)
    print(f"DataFrame created with {len(df)} activities")
    
    return df, len(valid_activities)

def main():
    import sys
    import os
    
    # Ajouter le répertoire backend au PYTHONPATH pour les imports
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
    sys.path.insert(0, backend_dir)
    
    # Ajouter aussi le répertoire courant au cas où
    sys.path.insert(0, os.path.dirname(os.path.dirname(current_dir)))
    
    try:
        from app.repositories.strava_activity import get_activities_for_prediction
        from app.database import get_db

        print("✅ Modules importés avec succès")
        
        db = next(get_db())
        print("✅ Session de base de données créée")
        athlete_id = 32883472

        print(f"Récupération des activités pour l'athlète {athlete_id}...")
        activities = get_activities_for_prediction(db, athlete_id)
        print(f"Récupéré {len(activities)} activités")
        
        df, valid_activities = process_activities_for_prediction(activities, db, athlete_id)

        print(f"Activités valides: {valid_activities}")

        if df is not None and len(df) > 0:
            print("✅ Données valides trouvées, entraînement du modèle...")
            print("bop ça passe ici")
            k1, k2, classifier = elev_func_ml(df, 3.5)
            print(f"✅ Modèle entraîné avec succès!")
            print(f"k1 (montée): {k1}")
            print(f"k2 (descente): {k2}")
        else:
            print("⚠️ Aucune donnée valide pour l'entraînement")
            
    except ImportError as e:
        print(f"❌ Erreur d'import: {e}")
        print("Vérifiez que vous êtes dans le bon répertoire et que les modules sont disponibles")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()