import React from 'react';

const Community: React.FC = () => {
  return (
    <section className="community">
      <div className="container">
        <div className="community-content">
          <h2>Join the PeakFlow community</h2>
          <p>
            Connect with fellow runners, share your achievements, and get the latest updates 
            on performance optimization techniques.
          </p>
          <div className="links">
            <a href="https://www.strava.com/clubs/1586855" target="_blank" rel="noopener noreferrer" className="link-item">
              <div className="link-icon">
                <span>🏃</span>
              </div>
              Strava Club
            </a>
            <a href="https://www.instagram.com/peakflow.tech/" target="_blank" rel="noopener noreferrer" className="link-item">
              <div className="link-icon">
                <span>📷</span>
              </div>
              Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;