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
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is not valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must contain at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstname) {
      newErrors.firstname = 'First name is required';
    }

    if (!formData.lastname) {
      newErrors.lastname = 'Last name is required';
    }

    if (!formData.charte_accepted) {
      newErrors.charte_accepted = 'You must accept the terms to continue';
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
    } catch (error: any) {
      // Affichage détaillé de l'erreur backend
      if (error && error.response) {
        // Si l'erreur contient une réponse (ex: axios)
        setSubmitError(error.response.data?.detail || JSON.stringify(error.response.data));
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else if (typeof error === 'object') {
        setSubmitError(JSON.stringify(error));
      } else {
        setSubmitError('Erreur inconnue lors de l\'inscription');
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 'var(--header-height)' }}>
      {/* Main Content */}
      <main className="auth-container">
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>
            Create Account
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
              First Name
            </label>
            <input
              id="firstname"
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleInputChange}
              className={`form-input ${errors.firstname ? 'error' : ''}`}
              placeholder="Your first name"
            />
            {errors.firstname && <p style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.firstname}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="lastname" className="form-label">
              Last Name
            </label>
            <input
              id="lastname"
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleInputChange}
              className={`form-input ${errors.lastname ? 'error' : ''}`}
              placeholder="Your last name"
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
              placeholder="your@email.com"
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
              placeholder="Your password"
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
              placeholder="Confirm your password"
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
                I accept the{' '}
                <Link to="/cgu" style={{ color: '#ff6b35', textDecoration: 'underline' }}>
                  terms of use
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
                Creating account...
              </div>
            ) : (
              'Create my account'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#666' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#ff6b35', textDecoration: 'underline' }}>
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register; 