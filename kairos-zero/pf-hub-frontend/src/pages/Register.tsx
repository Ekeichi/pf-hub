import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    lastname: '',
    charte_accepted: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.firstname) {
      newErrors.firstname = 'Le prénom est requis';
    }

    if (!formData.lastname) {
      newErrors.lastname = 'Le nom est requis';
    }

    if (!formData.charte_accepted) {
      newErrors.charte_accepted = 'Vous devez accepter la charte pour continuer';
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
      await register({
        email: formData.email,
        password: formData.password,
        firstname: formData.firstname,
        lastname: formData.lastname,
        charte_accepted: formData.charte_accepted
      });
      
      // Redirection vers la page de liaison Strava
      navigate('/strava-link');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 'var(--header-height)' }}>
      {/* Main Content */}
      <main className="auth-container">
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>
            Créer un compte
          </h2>
        </div>
        
        {submitError && (
          <div className="error-message">
            <p>{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstname" className="form-label">
              Prénom
            </label>
            <input
              id="firstname"
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleInputChange}
              className={`form-input ${errors.firstname ? 'error' : ''}`}
              placeholder="Votre prénom"
            />
            {errors.firstname && <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.firstname}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="lastname" className="form-label">
              Nom
            </label>
            <input
              id="lastname"
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleInputChange}
              className={`form-input ${errors.lastname ? 'error' : ''}`}
              placeholder="Votre nom"
            />
            {errors.lastname && <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.lastname}</p>}
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirmez votre mot de passe"
            />
            {errors.confirmPassword && <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.confirmPassword}</p>}
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="charte_accepted"
                checked={formData.charte_accepted}
                onChange={handleInputChange}
                style={{ marginRight: '0.5rem' }}
              />
              <span style={{ fontSize: '0.875rem' }}>
                J'accepte la{' '}
                <Link to="/charte" style={{ color: '#ff6b35', textDecoration: 'underline' }}>
                  charte d'utilisation
                </Link>
              </span>
            </label>
            {errors.charte_accepted && <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.charte_accepted}</p>}
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
                Création du compte...
              </div>
            ) : (
              'Créer mon compte'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#666' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: '#ff6b35', textDecoration: 'underline' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register; 