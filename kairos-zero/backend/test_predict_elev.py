#!/usr/bin/env python3
"""
Script de test pour predict_elev.py
"""

import sys
import os

# Ajouter le répertoire parent au PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_predict_elev():
    """Test du module predict_elev"""
    try:
        # Importer le module
        from app.utils.predict_elev import elev_func_ml, process_activities_for_prediction
        
        print("✅ Module predict_elev importé avec succès")
        
        # Test avec des données factices
        print("\n🧪 Test avec des données factices...")
        
        # Créer des données de test
        import pandas as pd
        import numpy as np
        
        # Données factices pour tester
        test_data = {
            "elevation_data": {
                "distance": [0, 100, 200, 300, 400, 500],
                "altitude": [100, 105, 110, 108, 112, 115]
            },
            "pace_data": {
                "time": [0, 30, 60, 90, 120, 150],
                "distance": [0, 100, 200, 300, 400, 500]
            },
            "heartrate_data": {
                "time": [0, 30, 60, 90, 120, 150],
                "heartrate": [140, 145, 150, 148, 152, 155]
            }
        }
        
        # Créer un DataFrame avec plusieurs activités
        activities = [test_data for _ in range(5)]
        df = pd.DataFrame(activities)
        
        print(f"DataFrame créé avec {len(df)} activités")
        
        # Tester la fonction principale
        vitesse_plat = 3.5  # m/s
        k1, k2, classifier = elev_func_ml(df, vitesse_plat)
        
        print(f"✅ Test réussi!")
        print(f"k1 (montée): {k1}")
        print(f"k2 (descente): {k2}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Erreur d'import: {e}")
        print("Assurez-vous que toutes les dépendances sont installées:")
        print("pip install pandas numpy scikit-learn matplotlib seaborn")
        return False
        
    except Exception as e:
        print(f"❌ Erreur lors du test: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_with_real_data():
    """Test avec de vraies données de la base de données"""
    try:
        print("\n🗄️ Test avec de vraies données de la base...")
        
        # Importer les modules nécessaires
        from app.repositories.strava_activity import get_activities_for_prediction
        from app.database import get_db
        from app.utils.predict_elev import elev_func_ml, process_activities_for_prediction
        
        # Créer une session de base de données
        db = get_db()
        athlete_id = 32883472
        
        print(f"Récupération des activités pour l'athlète {athlete_id}...")
        activities = get_activities_for_prediction(db, athlete_id)
        print(f"Récupéré {len(activities)} activités")
        
        # Traiter les activités
        df, valid_activities = process_activities_for_prediction(activities, db, athlete_id)
        
        if df is not None and len(df) > 0:
            print(f"✅ {valid_activities} activités valides trouvées")
            
            # Appliquer le modèle ML
            k1, k2, classifier = elev_func_ml(df, 3.5)
            
            print(f"✅ Modèle ML entraîné avec succès!")
            print(f"k1 (montée): {k1}")
            print(f"k2 (descente): {k2}")
            
            return True
        else:
            print("⚠️ Aucune activité avec des données valides trouvée")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors du test avec de vraies données: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Test du module predict_elev.py")
    print("=" * 50)
    
    # Test 1: Import et données factices
    success1 = test_predict_elev()
    
    # Test 2: Données réelles (optionnel)
    if success1:
        print("\n" + "=" * 50)
        success2 = test_with_real_data()
    
    print("\n" + "=" * 50)
    if success1:
        print("✅ Tests terminés avec succès!")
    else:
        print("❌ Tests échoués") 