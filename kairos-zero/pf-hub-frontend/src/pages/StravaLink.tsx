import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const StravaLink: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, rediriger vers la connexion
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  const handleStravaLink = () => {
    setIsLinking(true);
    // Redirection vers l'authentification Strava avec l'utilisateur connecté
    window.location.href = 'http://localhost:8000/api/strava/auth';
  };

  const handleSkipForNow = () => {
    // Redirection vers le dashboard sans liaison Strava
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirection en cours
  }

  return (
    <div className="container">
      {/* Header */}
      <header>
        <div className="logo">
          <Link to="/">PEAKFLOW TECHNOLOGIES</Link>
        </div>
        <nav>
          <ul className="nav-links">
            <li><Link to="/">KAIROS ZERO</Link></li>
            <li><Link to="/dashboard">DASHBOARD</Link></li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ paddingTop: 'var(--header-height)', minHeight: 'calc(100vh - var(--header-height))' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '3rem' }}>
            <h1>Welcome {user.firstname}!</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginTop: '1rem' }}>
              Your account has been created successfully. To fully enjoy Kairos Zero, 
              we recommend linking your Strava account.
            </p>
          </div>

          {/* Carte de liaison Strava */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid var(--color-border)', 
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="#FC4C02" style={{ marginBottom: '1rem' }}>
                <path d="M15.387 17.944c-.68.395-1.832 1.776-2.156 2.388-.324.612-1.296 1.668-2.156 2.388-.86.72-1.728 1.44-2.156 2.388-.428.948-.428 2.388-.428 2.388s0-1.44.428-2.388c.428-.948 1.296-1.668 2.156-2.388.86-.72 1.832-1.993 2.156-2.388.324-.395.68-.395 1.16 0z"/>
              </svg>
              <h2 style={{ marginBottom: '1rem' }}>Lier votre compte Strava</h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                En liant votre compte Strava, vous pourrez :
              </p>
            </div>

            <ul style={{ 
              textAlign: 'left', 
              listStyle: 'none', 
              padding: 0, 
              marginBottom: '2rem' 
            }}>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '0.75rem',
                color: 'var(--color-text-secondary)'
              }}>
                <span style={{ 
                  color: '#10B981', 
                  marginRight: '0.75rem', 
                  fontSize: '1.2rem' 
                }}>✓</span>
                Automatically sync your activities
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '0.75rem',
                color: 'var(--color-text-secondary)'
              }}>
                <span style={{ 
                  color: '#10B981', 
                  marginRight: '0.75rem', 
                  fontSize: '1.2rem' 
                }}>✓</span>
                Get accurate performance predictions
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '0.75rem',
                color: 'var(--color-text-secondary)'
              }}>
                <span style={{ 
                  color: '#10B981', 
                  marginRight: '0.75rem', 
                  fontSize: '1.2rem' 
                }}>✓</span>
                Track your progress over time
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'var(--color-text-secondary)'
              }}>
                <span style={{ 
                  color: '#10B981', 
                  marginRight: '0.75rem', 
                  fontSize: '1.2rem' 
                }}>✓</span>
                Analyser vos données d'entraînement
              </li>
            </ul>

            <button 
              onClick={handleStravaLink}
              disabled={isLinking}
              style={{ 
                width: '100%', 
                background: '#FC4C02',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}
            >
              {isLinking ? (
                <>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Liaison en cours...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.387 17.944c-.68.395-1.832 1.776-2.156 2.388-.324.612-1.296 1.668-2.156 2.388-.86.72-1.728 1.44-2.156 2.388-.428.948-.428 2.388-.428 2.388s0-1.44.428-2.388c.428-.948 1.296-1.668 2.156-2.388.86-.72 1.832-1.993 2.156-2.388.324-.395.68-.395 1.16 0z"/>
                  </svg>
                  Lier mon compte Strava
                </>
              )}
            </button>

            <button 
              onClick={handleSkipForNow}
              style={{ 
                width: '100%', 
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Passer pour l'instant
            </button>
          </div>

          <p style={{ 
            fontSize: '0.9rem', 
            color: 'var(--color-text-secondary)',
            lineHeight: '1.5'
          }}>
            Vous pourrez toujours lier votre compte Strava plus tard depuis votre profil.
          </p>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StravaLink; 