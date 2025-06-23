import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>PEAKFLOW TECHNOLOGIES</h4>
          </div>
          
          <div className="footer-section">
            <a href="https://github.com/peakflow-technologies" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="mailto:contact@peakflow-technologies.com">Contact</a>
            <a href="/privacy">Privacy</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 PeakFlow Technologies</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 