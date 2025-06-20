import React from "react";

const StravaLoginButton = () => {
  const handleLogin = () => {
    window.location.href = "/api/strava/auth";
  };

  return (
    <button onClick={handleLogin}>
      Se connecter avec Strava
    </button>
  );
};

export default StravaLoginButton; 