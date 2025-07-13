// StravaSuccess.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";

const StravaSuccess = () => {
  const [message, setMessage] = useState("Initialisation...");
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [result, setResult] = useState(null);
  const { isLoading } = useAuth();

  useEffect(() => {
    const linkAndSync = async () => {
      // Attendre que le contexte d'authentification soit initialisé
      if (isLoading) {
        setMessage("Initialisation...");
        return;
      }

      try {
        setIsSyncing(true);
        setMessage("Liaison du compte Strava...");
        
        // 1. Lier le token Strava à l'utilisateur connecté
        const linkResponse = await apiService.post('/strava/link-token');
        
        if (linkResponse.ok) {
          const linkData = await linkResponse.json();
          console.log("Liaison réussie:", linkData);
          if (linkData.message.includes("déjà lié")) {
            setMessage("Compte Strava déjà lié, synchronisation...");
          }
        }
        
        setMessage("Connexion à Strava...");
        
        // 2. Déclencher la synchronisation intelligente
        const syncResponse = await apiService.get('/strava/sync-intelligent');
        
        if (syncResponse.ok) {
          const data = await syncResponse.json();
          setResult(data);
          setMessage(data.message);
          setIsSyncing(false);
        } else {
          const errorData = await syncResponse.json();
          throw new Error(errorData.detail || "Erreur de synchronisation");
        }
        
      } catch (error) {
        console.error("Erreur:", error);
        setMessage(`Erreur: ${error.message}`);
        setHasError(true);
        setIsSyncing(false);
      }
    };

    linkAndSync();
  }, [isLoading]);

  return (
    <div className="container" style={{ paddingTop: '120px', minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2>Strava Activities Synchronization</h2>
        
        {hasError ? (
          <div style={{ marginTop: '20px', color: '#ff6b6b' }}>
            <p>{message}</p>
            <div style={{ marginTop: '20px' }}>
                              <Link to="/dashboard" className="btn btn-primary">
                  Back to dashboard
                </Link>
            </div>
          </div>
        ) : (
          <>
            <p>{message}</p>
            
            {(isLoading || isSyncing) && (
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

            {!isSyncing && !hasError && !isLoading && result && (
              <div style={{ marginTop: '2rem' }}>
                <p style={{ color: '#00d4ff', fontWeight: '600' }}>✅ {result.message}</p>
                {result.sync_info && (
                  <div style={{ marginTop: '1rem', textAlign: 'left', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                    <p><strong>Activities in Strava:</strong> {result.sync_info.total_activities_in_strava}</p>
                    <p><strong>New activities found:</strong> {result.sync_info.new_activities_found}</p>
                    <p><strong>Activities synchronized:</strong> {result.sync_info.successfully_synced}</p>
                  </div>
                )}
                <Link to="/upload-gpx" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Next step: Upload a GPX file
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