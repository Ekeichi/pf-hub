import React from 'react';

interface StravaLoginButtonProps {
  onLogin?: () => void;
  isLoading?: boolean;
}

const StravaLoginButton: React.FC<StravaLoginButtonProps> = ({ onLogin, isLoading = false }) => {
  const handleClick = () => {
    if (onLogin) {
      onLogin();
    } else {
      // Redirection par défaut vers l'authentification Strava
      window.location.href = 'http://localhost:8000/api/strava/auth';
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        backgroundColor: '#ff6b35',
        color: 'white',
        fontWeight: '600',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        border: 'none',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.5 : 1,
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = '#e55a2b';
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = '#ff6b35';
        }
      }}
    >
      {isLoading ? (
        <div className="spinner"></div>
      ) : (
        <svg style={{ width: '1.25rem', height: '1.25rem' }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.387 17.944c-.68.395-1.832 1.776-2.156 2.388-.324.612-1.296 1.668-2.156 2.388-.86.72-1.728 1.44-2.156 2.388-.428.948-.428 2.388-.428 2.388s0-1.44.428-2.388c.428-.948 1.296-1.668 2.156-2.388.86-.72 1.832-1.993 2.156-2.388.324-.395.68-.395 1.16 0z"/>
        </svg>
      )}
      {isLoading ? 'Connecting...' : 'Sign in with Strava'}
    </button>
  );
};

export default StravaLoginButton; 