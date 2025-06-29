import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StravaLoginButton from './StravaLoginButton';

const Home: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Effet parallax pour l'image hero
  useEffect(() => {
    const handleScroll = () => {
      const heroImage = document.querySelector('.hero-image') as HTMLElement;
      if (heroImage) {
        const scrollPosition = window.pageYOffset;
        const speed = 0.5; // Vitesse du parallax
        heroImage.style.transform = `translateY(${scrollPosition * speed}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation des cartes au hover
  useEffect(() => {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('hover');
      });
      
      card.addEventListener('mouseleave', () => {
        card.classList.remove('hover');
      });
    });
  }, []);

  return (
    <div className="container">
      {/* Header */}
      <header>
        <div className="logo">
          <Link to="/">PEAKFLOW TECHNOLOGIES</Link>
        </div>
        <nav>
          <button 
            className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
            onClick={toggleMenu}
            aria-label="Open menu" 
            aria-expanded={isMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <li><Link to="/" className="active">KAIROS ZERO</Link></li>
            <li><a href="#about">ABOUT</a></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="page-title">
            peakflow technologies presents<br />
            <span className="highlight-title">KAIROS ZERO</span>
          </div>
          <h1>Your personalized pacing strategy</h1>
          <p className="subtitle">
            Optimize your running race performance with advanced analytics. 
            Use Kairos Zero, the first born of the Kairos family.
          </p>
          <StravaLoginButton />
        </div>
        <div className="hero-image" data-speed="0.5">
          <img src="/image.png" alt="Runner visualization" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>A new frontier in running performance</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,10.5A1.5,1.5 0 0,1 13.5,12A1.5,1.5 0 0,1 12,13.5A1.5,1.5 0 0,1 10.5,12A1.5,1.5 0 0,1 12,10.5M7.5,12A1.5,1.5 0 0,1 9,13.5A1.5,1.5 0 0,1 7.5,15A1.5,1.5 0 0,1 6,13.5A1.5,1.5 0 0,1 7.5,12M16.5,12A1.5,1.5 0 0,1 18,13.5A1.5,1.5 0 0,1 16.5,15A1.5,1.5 0 0,1 15,13.5A1.5,1.5 0 0,1 16.5,12Z"></path>
              </svg>
            </div>
            <h3>Personalized Runner Profile</h3>
            <p>Advanced analytics that evaluates your running data, terrain, and unique strengths to create a tailored profile.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path fill="currentColor" d="M3,5H21V7H3V5M3,10H21V12H3V10M3,15H21V17H3V15M3,20H21V22H3V20Z"></path>
              </svg>
            </div>
            <h3>Terrain & Elevation Analysis</h3>
            <p>Precise calculations based on course elevation profiles to optimize your energy expenditure throughout the race.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path fill="currentColor" d="M16.5,5.5A2,2 0 0,0 18.5,3.5A2,2 0 0,0 16.5,1.5A2,2 0 0,0 14.5,3.5A2,2 0 0,0 16.5,5.5M12.9,19.4L13.9,15L16,17V23H18V15.5L15.9,13.5L16.5,10.5C17.89,12.09 19.89,13 22,13V11C20.24,11.03 18.6,10.11 17.7,8.6L16.7,7C16.34,6.4 15.7,6 15,6C14.7,6 14.5,6.1 14.2,6.1L9,8.3V13H11V9.6L12.8,8.9L11.2,17L6.3,16L5.9,18L12.9,19.4M4,9A1,1 0 0,1 3,8A1,1 0 0,1 4,7H7V9H4M5,5A1,1 0 0,1 4,4A1,1 0 0,1 5,3H10V5H5M3,13A1,1 0 0,1 2,12A1,1 0 0,1 3,11H7V13H3Z"></path>
              </svg>
            </div>
            <h3>Adaptive Pacing Strategies</h3>
            <p>Kilometer-by-kilometer pacing recommendations that adapt to changing race conditions and your fatigue levels.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path fill="currentColor" d="M6,19A5,5 0 0,1 1,14A5,5 0 0,1 6,9C7,6.65 9.3,5 12,5C15.43,5 18.24,7.66 18.5,11.03L19,11A4,4 0 0,1 23,15A4,4 0 0,1 19,19H6M19,13H17V12A5,5 0 0,0 12,7C9.5,7 7.45,8.82 7.06,11.19C6.73,11.07 6.37,11 6,11A3,3 0 0,0 3,14A3,3 0 0,0 6,17H19A2,2 0 0,0 21,15A2,2 0 0,0 19,13Z"></path>
              </svg>
            </div>
            <h3>Weather Integration</h3>
            <p>Optional weather data integration to account for temperature, humidity, and wind conditions in your race strategy.</p>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="community">
        <div className="community-content">
          <h2>Join the PeakFlow community</h2>
          <div className="links">
            <a href="https://github.com/peakflow-technologies" target="_blank" rel="noopener noreferrer" className="link-item">
              <span className="link-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"></path>
                </svg>
              </span>
              <span>GitHub Repository</span>
            </a>
            <a href="#" className="link-item">
              <span className="link-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M9,13V19H7V13H9M15,15V19H17V15H15M11,15V19H13V15H11M9,11V12H7V11H9Z"></path>
                </svg>
              </span>
              <span>Research Paper</span>
            </a>
          </div>
          <Link to="/upload-gpx" className="btn secondary">
            TRY IT NOW
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-left">
            <p className="footer-logo">PEAKFLOW TECHNOLOGIES</p>
            <p className="copyright">© 2025 PeakFlow Technologies</p>
          </div>
          <div className="footer-links">
            <a href="https://github.com/peakflow-technologies" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="mailto:contact@peakflow-technologies.com">Contact</a>
            <a href="/privacy">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 