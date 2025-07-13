import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/apiService';

interface HeartRateZones {
  zone_1_time: number;
  zone_2_time: number;
  zone_3_time: number;
  zone_4_time: number;
  zone_5_time: number;
  effort_score: number;
}

const HeartRateZones: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [zones, setZones] = useState<HeartRateZones | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchZones = async () => {
      if (!token || !activityId) return;
      
      try {
        setLoading(true);
        const response = await ApiService.getActivityHeartRateZones(parseInt(activityId));
        setZones(response);
      } catch (err) {
        setError('Error loading heart rate zones');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, [token, activityId]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getZoneColor = (zone: number): string => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-orange-100 text-orange-800',
      'bg-red-100 text-red-800'
    ];
    return colors[zone - 1] || 'bg-gray-100 text-gray-800';
  };

  const getZoneDescription = (zone: number): string => {
    const descriptions = [
      'Active recovery',
      'Fundamental endurance',
      'Aerobic threshold',
      'Anaerobic threshold',
      'Maximum zone'
    ];
    return descriptions[zone - 1] || 'Unknown zone';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading heart rate zones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  if (!zones) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">No heart rate zone data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Heart Rate Zones</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
          >
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Zones cardiaques */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Zone Distribution</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((zone) => {
                const timeKey = `zone_${zone}_time` as keyof HeartRateZones;
                const time = zones[timeKey];
                const totalTime = zones.zone_1_time + zones.zone_2_time + zones.zone_3_time + zones.zone_4_time + zones.zone_5_time;
                const percentage = totalTime > 0 ? Math.round((time / totalTime) * 100) : 0;
                
                return (
                  <div key={zone} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${getZoneColor(zone).split(' ')[0]}`}></div>
                      <span className="font-medium">Zone {zone}</span>
                      <span className="text-gray-400 text-sm">({getZoneDescription(zone)})</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatTime(time)}</div>
                      <div className="text-gray-400 text-sm">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Score d'effort */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Effort Score</h2>
            <div className="text-center">
              <div className="text-6xl font-bold text-orange-500 mb-4">
                {Math.round(zones.effort_score)}
              </div>
              <div className="text-gray-400">
                Score TRIMP (Training Impulse)
              </div>
              <div className="mt-4 text-sm text-gray-500">
                This score measures the intensity of your training by taking into account the time spent in each heart rate zone.
              </div>
            </div>
          </div>
        </div>

        {/* Graphique en barres */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
                      <h2 className="text-2xl font-semibold mb-6">Visualization</h2>
          <div className="flex items-end gap-2 h-32">
            {[1, 2, 3, 4, 5].map((zone) => {
              const timeKey = `zone_${zone}_time` as keyof HeartRateZones;
              const time = zones[timeKey];
              const totalTime = zones.zone_1_time + zones.zone_2_time + zones.zone_3_time + zones.zone_4_time + zones.zone_5_time;
              const percentage = totalTime > 0 ? (time / totalTime) * 100 : 0;
              
              return (
                <div key={zone} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full ${getZoneColor(zone).split(' ')[0]} rounded-t`}
                    style={{ height: `${percentage}%` }}
                  ></div>
                  <div className="text-xs text-gray-400 mt-2">Z{zone}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeartRateZones; 