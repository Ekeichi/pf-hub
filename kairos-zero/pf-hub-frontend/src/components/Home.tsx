import React from 'react';
import { Link } from 'react-router-dom';
import StravaLoginButton from './StravaLoginButton';

const Home: React.FC = () => {
  return (
    <div className="container">
      {/* Navigation */}
      <nav>
        <ul>
          <li><Link to="/">PEAKFLOW TECHNOLOGIES</Link></li>
          <li><Link to="/">KAIROS ZERO</Link></li>
          <li><a href="#about">ABOUT</a></li>
        </ul>
      </nav>

      {/* Main Content - Split Screen */}
      <main>
        {/* Left Section */}
        <div className="left-section">
          <p className="subtitle">peakflow technologies presents</p>
          <h1>KAIROS ZERO</h1>
          <h2>Your personalized pacing strategy</h2>
          <p className="desc">
            Optimize your running race performance with advanced analytics. 
            Use Kairos Zero, the first born of the Kairos family.
          </p>
          
          <StravaLoginButton />
          
          <p className="available">Available now</p>
          <ul className="links">
            <li><a href="https://github.com/peakflow-technologies" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
            <li><a href="#">Research Paper</a></li>
          </ul>
        </div>

        {/* Right Section - Background Image */}
        <div className="right-section">
          {/* Title Overlay */}
          <div className="title-overlay">
            <p className="presents">peakflow technologies presents</p>
            <h1>KAIROS ZERO</h1>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; 