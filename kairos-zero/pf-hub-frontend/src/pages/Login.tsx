import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      
      // Redirection vers le dashboard ou la page principale
      navigate('/dashboard');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erreur lors de la connexion');
    }
  };

  const handleStravaLogin = () => {
    // Redirection vers l'authentification Strava
    window.location.href = 'http://localhost:8000/api/strava/auth';
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 'var(--header-height)' }}>
      {/* Main Content */}
      <main className="auth-container">
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>
            Se connecter
          </h2>
        </div>
        
        {submitError && (
          <div className="error-message">
            <p>{submitError}</p>
          </div>
        )}

        {/* Connexion par email/mot de passe */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="votre@email.com"
            />
            {errors.email && <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Votre mot de passe"
            />
            {errors.password && <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.password}</p>}
          </div>

          <button 
            type="submit" 
            className="btn primary"
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner"></div>
                Connexion...
              </div>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Séparateur */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, borderTop: '1px solid #333' }}></div>
          <span style={{ padding: '0 1rem', color: '#666' }}>ou</span>
          <div style={{ flex: 1, borderTop: '1px solid #333' }}></div>
        </div>

        {/* Connexion Strava */}
        <button 
          onClick={handleStravaLogin}
          className="btn strava"
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', display: 'inline' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.387 17.944c-.68.395-1.832 1.776-2.156 2.388-.324.612-1.296 1.668-2.156 2.388-.86.72-1.728 1.44-2.156 2.388-.428.948-.428 2.388-.428 2.388s0-1.44.428-2.388c.428-.948 1.296-1.668 2.156-2.388.86-.72 1.832-1.993 2.156-2.388.324-.395.68-.395 1.16 0z"/>
          </svg>
          Se connecter avec Strava
        </button>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: '#ff6b35', textDecoration: 'underline' }}>
              S'inscrire
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" style={{ color: '#666', fontSize: '0.875rem' }}>
              Mot de passe oublié ?
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login; 