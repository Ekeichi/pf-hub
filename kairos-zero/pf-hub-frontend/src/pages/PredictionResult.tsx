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
      'Facile': 'text-green-400',
      'Modéré': 'text-yellow-400',
      'Difficile': 'text-orange-400',
      'Très difficile': 'text-red-400'
    };
    return colors[difficulty as keyof typeof colors] || 'text-gray-400';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!prediction) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Aucun résultat disponible</h1>
          <p className="text-gray-400 mb-8">
            Aucune prédiction n'a été trouvée. Veuillez uploader un fichier GPX.
          </p>
          <button
            onClick={() => navigate('/upload-gpx')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Uploader un fichier GPX
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Résultats de la prédiction</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
          >
            Retour au dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Prédiction principale */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Prédiction de temps</h2>
            <div className="text-center">
              <div className="text-6xl font-bold text-orange-500 mb-4">
                {prediction.predicted_time ? formatTime(prediction.predicted_time) : 'N/A'}
              </div>
              <div className="text-gray-400">
                Temps estimé pour compléter le parcours
              </div>
            </div>
          </div>

          {/* Niveau de confiance */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Niveau de confiance</h2>
            <div className="text-center">
              <div className={`text-6xl font-bold mb-4 ${getConfidenceColor(prediction.confidence || 0)}`}>
                {prediction.confidence ? `${prediction.confidence}%` : 'N/A'}
              </div>
              <div className="text-gray-400">
                Fiabilité de la prédiction
              </div>
            </div>
          </div>
        </div>

        {/* Détails du parcours */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Détails du parcours</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {prediction.distance ? `${(prediction.distance / 1000).toFixed(1)} km` : 'N/A'}
              </div>
              <div className="text-gray-400">Distance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {prediction.elevation_gain ? `${prediction.elevation_gain}m` : 'N/A'}
              </div>
              <div className="text-gray-400">Dénivelé positif</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${getDifficultyColor(prediction.difficulty || '')}`}>
                {prediction.difficulty || 'N/A'}
              </div>
              <div className="text-gray-400">Niveau de difficulté</div>
            </div>
          </div>
        </div>

        {/* Recommandations */}
        {prediction.recommendations && prediction.recommendations.length > 0 && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Recommandations</h2>
            <ul className="space-y-3">
              {prediction.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => navigate('/upload-gpx')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Analyser un autre parcours
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionResult;