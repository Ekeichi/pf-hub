// StravaSuccess.tsx
import React, { useEffect } from "react";

const StravaSuccess = () => {
  useEffect(() => {
    // On marque dans le localStorage que Strava vient d'être connecté
    localStorage.setItem("stravaJustConnected", "1");
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h2>Connexion Strava réussie !</h2>
      <p>Votre compte Strava est maintenant lié à votre profil.</p>
      <a href="/prediction-result">Voir le résultat de la prédiction</a>
    </div>
  );
};

export default StravaSuccess;