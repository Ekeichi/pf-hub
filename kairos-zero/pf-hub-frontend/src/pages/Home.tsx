import React, { useEffect, useState } from "react";
import StravaLoginButton from "../components/StravaLoginButton";

const Home = () => {
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("stravaJustConnected") === "1") {
      localStorage.removeItem("stravaJustConnected");
      fetch("/api/strava/activities")
        .then(res => {
          if (!res.ok) throw new Error("Erreur acquisition Strava");
          return res.json();
        })
        .then(() => {
          return fetch("/api/test-simple");
        })
        .then(res => {
          if (!res.ok) throw new Error("Erreur prédiction");
          return res.json();
        })
        .then(data => setPrediction(data))
        .catch(err => {
            setPrediction(null);
        });
    }
  }, []);

  return (
    <div>
      <h1>Bienvenue</h1>
      <StravaLoginButton />
      {prediction && (
        <div style={{ marginTop: 20 }}>
          <h3>Résultat de la prédiction :</h3>
          <pre>{JSON.stringify(prediction, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Home;