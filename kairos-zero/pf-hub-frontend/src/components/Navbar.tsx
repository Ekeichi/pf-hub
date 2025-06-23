import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="logo">
          PEAKFLOW TECHNOLOGIES
        </Link>
        
        <ul className="nav-links">
          <li><Link to="/">KAIROS ZERO</Link></li>
          <li><a href="#about">ABOUT</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 