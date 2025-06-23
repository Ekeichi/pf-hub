import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PredictionResult = () => {
  const [prediction, setPrediction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runPrediction = async () => {
      try {
        // On lance l'acquisition et la prédiction dès l'arrivée sur la page
        await fetch("/api/strava/activities");
        const response = await fetch("/api/test/test-simple");
        const data = await response.json();
        setPrediction(data);
      } catch (err: any) {
        setPrediction({ erreur: err.message });
      } finally {
        setIsLoading(false);
      }
    };

    runPrediction();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '120px', minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Résultat de la prédiction</h2>
        
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading" style={{ margin: '0 auto 1rem' }}></div>
            <p>Calcul de la prédiction en cours...</p>
          </div>
        ) : prediction ? (
          <div style={{ textAlign: 'left' }}>
            <pre style={{ 
              background: 'var(--secondary-bg)', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              overflow: 'auto',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              {JSON.stringify(prediction, null, 2)}
            </pre>
          </div>
        ) : (
          <p style={{ textAlign: 'center' }}>Aucun résultat disponible</p>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/" className="btn btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PredictionResult;