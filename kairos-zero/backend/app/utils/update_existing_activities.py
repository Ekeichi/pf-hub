"""
Script pour mettre à jour les activités existantes avec les zones cardiaques et scores d'effort.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.database import SessionLocal
from app.models.strava_activity import StravaActivity
from app.utils.heart_rate_zones import calculate_heart_rate_zones, calculate_effort_score

def update_all_effort_scores():
    db = SessionLocal()
    try:
        activities = db.query(StravaActivity).all()
        print(f"Nombre d'activités à mettre à jour : {len(activities)}")
        updated = 0
        for act in activities:
            if not act.heartrate_data:
                continue
            zone_data = calculate_heart_rate_zones(act.heartrate_data)
            if zone_data and 'zones' in zone_data:
                act.effort_score = calculate_effort_score(zone_data)
                # Mettre à jour les temps par zone aussi
                for zone in ['zone_1_time', 'zone_2_time', 'zone_3_time', 'zone_4_time', 'zone_5_time', 'below_zone_1_time', 'above_zone_5_time']:
                    zone_key = zone.replace('_time', '')
                    if zone_key in zone_data['zones']:
                        setattr(act, zone, zone_data['zones'][zone_key]['time_minutes'])
                updated += 1
        db.commit()
        print(f"{updated} activités mises à jour.")
    finally:
        db.close()

if __name__ == '__main__':
    update_all_effort_scores() 