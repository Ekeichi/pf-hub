"""
Script pour mettre à jour les activités existantes avec les zones cardiaques et scores d'effort.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.database import SessionLocal
from app.models.strava_activity import StravaActivity
from app.utils.heart_rate_zones import calculate_heart_rate_zones, calculate_effort_score
import json


def update_existing_activities():
    """
    Met à jour toutes les activités existantes avec les zones cardiaques et scores d'effort.
    """
    db = SessionLocal()
    
    try:
        # Récupérer toutes les activités qui ont des données de fréquence cardiaque
        activities = db.query(StravaActivity).filter(
            StravaActivity.heartrate_data.isnot(None)
        ).all()
        
        print(f"Trouvé {len(activities)} activités avec données de fréquence cardiaque")
        
        updated_count = 0
        
        for activity in activities:
            try:
                if not activity.heartrate_data:
                    continue
                
                # Calculer les zones cardiaques
                zone_data = calculate_heart_rate_zones(activity.heartrate_data)
                
                if zone_data and "zones" in zone_data:
                    # Extraire les temps par zone
                    zone_times = {
                        "zone_1_time": 0.0,
                        "zone_2_time": 0.0,
                        "zone_3_time": 0.0,
                        "zone_4_time": 0.0,
                        "zone_5_time": 0.0,
                        "below_zone_1_time": 0.0,
                        "above_zone_5_time": 0.0
                    }
                    
                    for zone_name, zone_info in zone_data["zones"].items():
                        if zone_name in zone_times:
                            zone_times[zone_name] = zone_info.get("time_minutes", 0.0)
                    
                    # Calculer le score d'effort
                    effort_score = calculate_effort_score(zone_data)
                    
                    # Mettre à jour l'activité
                    activity.zone_1_time = zone_times["zone_1_time"]
                    activity.zone_2_time = zone_times["zone_2_time"]
                    activity.zone_3_time = zone_times["zone_3_time"]
                    activity.zone_4_time = zone_times["zone_4_time"]
                    activity.zone_5_time = zone_times["zone_5_time"]
                    activity.below_zone_1_time = zone_times["below_zone_1_time"]
                    activity.above_zone_5_time = zone_times["above_zone_5_time"]
                    activity.effort_score = effort_score
                    
                    updated_count += 1
                    print(f"✓ Activité {activity.activity_id} mise à jour (score: {effort_score:.2f})")
                else:
                    print(f"✗ Activité {activity.activity_id}: pas de données de zones valides")
                    
            except Exception as e:
                print(f"✗ Erreur sur l'activité {activity.activity_id}: {str(e)}")
                continue
        
        # Sauvegarder les changements
        db.commit()
        print(f"\n✅ {updated_count} activités mises à jour avec succès")
        
    except Exception as e:
        print(f"Erreur générale: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    update_existing_activities() 