import React from 'react';

const Features: React.FC = () => {
  const features = [
    {
      icon: "🏃‍♂️",
      title: "Personalized Runner Profile",
      description: "Create a comprehensive profile based on your running history, fitness level, and performance metrics."
    },
    {
      icon: "🏔️",
      title: "Terrain & Elevation Analysis",
      description: "Advanced analysis of race terrain, elevation changes, and their impact on your pacing strategy."
    },
    {
      icon: "🎯",
      title: "Adaptive Pacing Strategies",
      description: "Dynamic pacing recommendations that adapt to race conditions and your real-time performance."
    },
    {
      icon: "🌤️",
      title: "Weather Integration",
      description: "Real-time weather data integration to optimize your race strategy based on current conditions."
    }
  ];

  return (
    <section className="features">
      <div className="container">
        <h2>A new frontier in running performance</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              onMouseEnter={(e) => e.currentTarget.classList.add('hover')}
              onMouseLeave={(e) => e.currentTarget.classList.remove('hover')}
            >
              <div className="feature-icon">
                <span style={{ fontSize: '2rem' }}>{feature.icon}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 