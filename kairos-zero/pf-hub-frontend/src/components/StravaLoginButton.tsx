import React from "react";

const StravaLoginButton: React.FC = () => {
  const handleLogin = () => {
    window.location.href = "/api/strava/auth";
  };

  return (
    <button onClick={handleLogin} className="btn">
      START NOW
    </button>
  );
};

export default StravaLoginButton; 