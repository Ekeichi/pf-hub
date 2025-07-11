import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    if (location.state?.prediction) {
      setPrediction(location.state.prediction);
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
      'Facile': '#22c55e',
      'Modéré': '#eab308',
      'Difficile': '#f97316',
      'Très difficile': '#ef4444'
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
            <h1 style={{ marginBottom: '1rem' }}>Aucun résultat disponible</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
              Aucune prédiction n'a été trouvée. Veuillez uploader un fichier GPX.
            </p>
            <button
              onClick={() => navigate('/upload-gpx')}
              className="btn primary"
            >
              Uploader un fichier GPX
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <main style={{ paddingTop: 'var(--header-height)', minHeight: 'calc(100vh - var(--header-height))' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h1>Résultats de la prédiction</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn secondary"
            >
              Retour au dashboard
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* Prédiction principale */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Prédiction de temps</h2>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ff6b35', marginBottom: '1rem' }}>
                  {prediction.predicted_time ? formatTime(prediction.predicted_time) : 'N/A'}
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  Temps estimé pour compléter le parcours
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
              <h2 style={{ marginBottom: '1.5rem' }}>Niveau de confiance</h2>
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
                  Fiabilité de la prédiction
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
            <h2 style={{ marginBottom: '1.5rem' }}>Détails du parcours</h2>
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
                <div style={{ color: 'var(--color-text-secondary)' }}>Dénivelé positif</div>
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
                <div style={{ color: 'var(--color-text-secondary)' }}>Niveau de difficulté</div>
              </div>
            </div>
          </div>

          {/* Recommandations */}
          {prediction.recommendations && prediction.recommendations.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Recommandations</h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {prediction.recommendations.map((recommendation, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#ff6b35',
                      borderRadius: '50%',
                      marginTop: '8px',
                      flexShrink: 0
                    }}></div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/upload-gpx')}
              className="btn primary"
            >
              Analyser un autre parcours
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn secondary"
            >
              Retour au dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PredictionResult;