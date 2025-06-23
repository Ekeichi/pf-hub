import React from 'react';

const Features: React.FC = () => {
  const features = [
    {
      icon: "🏃‍♂️",
      title: "Personalized Runner Profile",
      description: "Advanced analytics that evaluates your running data, terrain, and unique strengths to create a tailored profile."
    },
    {
      icon: "⛰️",
      title: "Terrain & Elevation Analysis",
      description: "Precise calculations based on course elevation profiles to optimize your energy expenditure throughout the race."
    },
    {
      icon: "📊",
      title: "Adaptive Pacing Strategies",
      description: "Kilometer-by-kilometer pacing recommendations that adapt to changing race conditions and your fatigue levels."
    },
    {
      icon: "🌤️",
      title: "Weather Integration",
      description: "Optional weather data integration to account for temperature, humidity, and wind conditions in your race strategy."
    }
  ];

  return (
    <>
      {/* Runner Visualization Section */}
      <section className="runner-section">
        <div className="container">
          <h2 className="runner-title fade-in-up">Runner visualization</h2>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" id="features">
        <div className="container">
          <div className="fade-in-up" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2>A new frontier in running performance</h2>
          </div>
          
          <div className="card-grid">
            {features.map((feature, index) => (
              <div key={index} className="card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="community-section">
        <div className="container">
          <h3 className="community-title">Join the PeakFlow community</h3>
          <div className="community-buttons">
            <a href="https://github.com/peakflow-technologies" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              GitHub Repository
            </a>
            <a href="#" className="btn btn-secondary">
              Research Paper
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Features; 