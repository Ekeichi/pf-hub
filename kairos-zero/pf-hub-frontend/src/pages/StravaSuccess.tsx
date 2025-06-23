// StravaSuccess.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const StravaSuccess = () => {
  const [message, setMessage] = useState("Synchronisation en cours...");
  const [isSyncing, setIsSyncing] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const syncActivities = async () => {
      try {
        setMessage("Connexion à Strava...");
        
        const response = await fetch("/api/strava/sync-simple");
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Erreur de synchronisation");
        }
        
        const data = await response.json();
        setResult(data);
        setMessage(data.message);
        setIsSyncing(false);
        
      } catch (error) {
        console.error("Erreur de synchronisation:", error);
        setMessage(`Erreur: ${error.message}`);
        setHasError(true);
        setIsSyncing(false);
      }
    };

    syncActivities();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '120px', minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2>Synchronisation des activités Strava</h2>
        
        {hasError ? (
          <div style={{ marginTop: '20px', color: '#ff6b6b' }}>
            <p>{message}</p>
            <div style={{ marginTop: '20px' }}>
              <Link to="/" className="btn btn-primary">
                Retour à l'accueil et reconnexion Strava
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p>{message}</p>
            
            {isSyncing && (
              <div style={{ margin: '2rem 0' }}>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: '100%',
                      animation: 'pulse 2s infinite'
                    }}
                  />
                </div>
                <div className="loading" style={{ margin: '1rem auto' }}></div>
              </div>
            )}

            {!isSyncing && !hasError && result && (
              <div style={{ marginTop: '2rem' }}>
                <p style={{ color: '#00d4ff', fontWeight: '600' }}>✅ {result.message}</p>
                <p>Activités synchronisées: {result.successful_syncs}/{result.total_activities}</p>
                <Link to="/upload-gpx" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Étape suivante : Uploader un fichier GPX
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StravaSuccess;