import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GPX3DViewer from '../components/GPX3DViewer';
import { parseGPXFromFile } from '../utils/gpxParser';
import type { GPXPoint } from '../utils/gpxParser';

interface PredictionData {
  predicted_time?: string;
  confidence?: number;
  elevation_gain?: number;
  distance?: number;
  difficulty?: string;
  recommendations?: string[];
}

const PredictionResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [gpxData, setGpxData] = useState<GPXPoint[]>([]);
  // const [isLoadingGPX, setIsLoadingGPX] = useState(false);

  useEffect(() => {
    if (location.state?.prediction) {
      setPrediction(location.state.prediction);
    }
    
    // Parser les données GPX si disponibles
    if (location.state?.gpxFile) {
      parseGPXFromFile(location.state.gpxFile)
        .then((points) => {
          setGpxData(points);
        })
        .catch((error) => {
          console.error('Error parsing GPX:', error);
        });
    }
  }, [location.state]);

  const formatTime = (timeString: string): string => {
    // Convertir le format "HH:MM:SS" en format lisible
    const parts = timeString.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseInt(parts[2]);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    const colors = {
      'Easy': '#22c55e',
      'Moderate': '#eab308',
      'Difficult': '#f97316',
      'Very difficult': '#ef4444'
    };
    return colors[difficulty as keyof typeof colors] || 'var(--color-text-secondary)';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return '#22c55e';
    if (confidence >= 60) return '#eab308';
    return '#ef4444';
  };

  if (!prediction) {
    return (
      <div className="container">
        <main style={{ paddingTop: 'var(--header-height)', minHeight: 'calc(100vh - var(--header-height))' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '1rem' }}>No results available</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
              No prediction found. Please upload a GPX file.
            </p>
            <button
              onClick={() => navigate('/upload-gpx')}
              className="btn primary"
            >
              Upload a GPX file
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <main style={{ paddingTop: 'var(--header-height)', minHeight: 'calc(100vh - var(--header-height))' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: window.innerWidth <= 768 ? '1rem' : '2rem' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: window.innerWidth <= 768 ? '1rem' : '2rem',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
            gap: window.innerWidth <= 768 ? '1rem' : '0'
          }}>
            <h1 style={{ 
              fontSize: window.innerWidth <= 768 ? '1.8rem' : '2.5rem',
              textAlign: window.innerWidth <= 768 ? 'center' : 'left'
            }}>
              Prediction Results
            </h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn secondary"
            >
              Back to dashboard
            </button>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: window.innerWidth <= 768 ? '1rem' : '2rem', 
            marginBottom: window.innerWidth <= 768 ? '1rem' : '2rem' 
          }}>
            {/* Prédiction principale */}
                          <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: window.innerWidth <= 768 ? '1rem' : '2rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <h2 style={{ 
                  marginBottom: window.innerWidth <= 768 ? '1rem' : '1.5rem',
                  fontSize: window.innerWidth <= 768 ? '1.2rem' : '1.5rem'
                }}>
                  Time Prediction
                </h2>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? '2rem' : '3rem', 
                    fontWeight: 'bold', 
                    color: '#ff6b35', 
                    marginBottom: '1rem' 
                  }}>
                    {prediction.predicted_time ? formatTime(prediction.predicted_time) : 'N/A'}
                  </div>
                  <div style={{ 
                    color: 'var(--color-text-secondary)',
                    fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem'
                  }}>
                    Estimated time to complete the route
                  </div>
                </div>
              </div>

            {/* Niveau de confiance */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Confidence Level</h2>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '3rem', 
                  fontWeight: 'bold', 
                  color: getConfidenceColor(prediction.confidence || 0),
                  marginBottom: '1rem'
                }}>
                  {prediction.confidence ? `${prediction.confidence}%` : 'N/A'}
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  Prediction reliability
                </div>
              </div>
            </div>
          </div>

          {/* Détails du parcours */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Route Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>
                  {prediction.distance ? `${(prediction.distance / 1000).toFixed(1)} km` : 'N/A'}
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>Distance</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '0.5rem' }}>
                  {prediction.elevation_gain ? `${prediction.elevation_gain}m` : 'N/A'}
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>Elevation gain</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: getDifficultyColor(prediction.difficulty || ''),
                  marginBottom: '0.5rem'
                }}>
                  {prediction.difficulty || 'N/A'}
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>Difficulty level</div>
              </div>
            </div>
          </div>

          {/* Visualisation 3D du parcours */}
          {gpxData.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: window.innerWidth <= 768 ? '1rem' : '2rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 style={{ 
                marginBottom: window.innerWidth <= 768 ? '1rem' : '1.5rem',
                fontSize: window.innerWidth <= 768 ? '1.2rem' : '1.5rem'
              }}>
                3D Route Visualization
              </h2>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: window.innerWidth <= 768 ? '0.5rem' : '1rem'
              }}>
                <div style={{ 
                  width: '100%', 
                  maxWidth: '800px', 
                  height: window.innerWidth <= 768 ? '250px' : '400px',
                  position: 'relative'
                }}>
                  <GPX3DViewer 
                    gpxData={gpxData} 
                    width={window.innerWidth <= 768 ? window.innerWidth - 40 : 800} 
                    height={window.innerWidth <= 768 ? 250 : 400} 
                  />
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: window.innerWidth <= 768 ? '1rem' : '2rem', 
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  marginTop: window.innerWidth <= 768 ? '0.5rem' : '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ 
                      width: window.innerWidth <= 768 ? '10px' : '12px', 
                      height: window.innerWidth <= 768 ? '10px' : '12px', 
                      backgroundColor: '#00ff00', 
                      borderRadius: '50%' 
                    }}></div>
                    <span style={{ 
                      color: 'var(--color-text-secondary)', 
                      fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem' 
                    }}>Start</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ 
                      width: window.innerWidth <= 768 ? '10px' : '12px', 
                      height: window.innerWidth <= 768 ? '10px' : '12px', 
                      backgroundColor: '#ff0000', 
                      borderRadius: '50%' 
                    }}></div>
                    <span style={{ 
                      color: 'var(--color-text-secondary)', 
                      fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem' 
                    }}>Finish</span>
                  </div>
                </div>
                <p style={{ 
                  color: 'var(--color-text-secondary)', 
                  fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem', 
                  textAlign: 'center',
                  marginTop: '0.5rem'
                }}>
                  {window.innerWidth <= 768 
                    ? 'Touch and drag to rotate, pinch to zoom' 
                    : 'Use the mouse to rotate, zoom and navigate in the 3D view'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/upload-gpx')}
              className="btn primary"
            >
              Analyze another route
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn secondary"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PredictionResult;