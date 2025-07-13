import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Community from '../components/Community';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Hero />
      <Features />
      <Community />
      <Footer />
    </div>
  );
};

export default Home; 