import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header>
      <div className="logo">
        <Link to="/">PEAKFLOW TECHNOLOGIES</Link>
      </div>
      <nav>
        <ul className="nav-links">
          {user ? (
            <>
              <li>
                <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
                  DASHBOARD
                </Link>
              </li>
              <li>
                <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
                  PROFILE
                </Link>
              </li>
              <li>
                <button 
                  onClick={logout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    paddingBottom: '5px'
                  }}
                >
                  LOGOUT
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/" className={isActive('/') ? 'active' : ''}>
                  KAIROS ZERO
                </Link>
              </li>
              <li>
                <Link to="/about" className={isActive('/about') ? 'active' : ''}>
                  ABOUT
                </Link>
              </li>
              <li>
                <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>...</span>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar; 