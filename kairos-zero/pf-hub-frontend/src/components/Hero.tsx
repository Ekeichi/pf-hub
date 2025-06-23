import React from 'react';
import { Link } from 'react-router-dom';
import StravaLoginButton from './StravaLoginButton';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content fade-in-up">
          <p className="hero-subtitle">peakflow technologies presents</p>
          <h1 className="hero-title">KAIROS ZERO</h1>
          <h2>Your personalized pacing strategy</h2>
          <p className="hero-description">
            Optimize your running race performance with advanced analytics. 
            Use Kairos Zero, the first born of the Kairos family.
          </p>
          
          <div className="hero-buttons">
            <StravaLoginButton />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 