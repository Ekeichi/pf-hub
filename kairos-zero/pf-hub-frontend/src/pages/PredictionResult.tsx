import React, { useEffect, useState } from "react";

const PredictionResult = () => {
  const [prediction, setPrediction] = useState<any>(null);

  useEffect(() => {
    // On lance l'acquisition et la prédiction dès l'arrivée sur la page
    fetch("/api/strava/activities")
      .then(res => res.json())
      .then(() => fetch("/api/test-simple"))
      .then(res => res.json())
      .then(data => setPrediction(data))
      .catch(err => setPrediction({ erreur: err.message }));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h2>Résultat de la prédiction</h2>
      {prediction ? (
        <pre style={{ textAlign: "left", display: "inline-block" }}>
          {JSON.stringify(prediction, null, 2)}
        </pre>
      ) : (
        <p>Chargement...</p>
      )}
      <div style={{ marginTop: 20 }}>
        <a href="/">Retour à l'accueil</a>
      </div>
    </div>
  );
};

export default PredictionResult;