import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="subtitle" style={{ fontSize: '1rem', fontWeight: '400', marginBottom: '1rem', textAlign: 'center' }}>
          PEAKFLOW TECHNOLOGIES PRESENTS
        </p>
        <h1 className="hero-title" style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '1rem', lineHeight: '1', textAlign: 'center' }}>
          KAIROS ZERO
        </h1>
        <p className="subtitle" style={{ fontSize: '1.5rem', fontWeight: '400', marginBottom: '2rem' }}>
          YOUR PERSONALIZED PACING STRATEGY
        </p>
        <p className="hero-description" style={{ fontSize: '1rem', lineHeight: '1.5', marginBottom: '3rem' }}>
          Optimize your running race performance with advanced analytics. Use Kairos Zero, the first born of the Kairos family.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn primary">
            START NOW
          </Link>
          <Link to="/login" className="btn secondary">
            LOG IN
          </Link>
        </div>
      </div>
      <div className="hero-image">
        <img 
          src="/image.png" 
          alt="Running athletes" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'grayscale(100%) contrast(120%)'
          }}
        />
      </div>
    </section>
  );
};

export default Hero; 