import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import CGU from './pages/CGU';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import StravaLink from './pages/StravaLink';
import StravaSuccess from './pages/StravaSuccess';
import UploadGPX from './pages/UploadGPX';
import PredictionResult from './pages/PredictionResult';
import HeartRateZones from './pages/HeartRateZones';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: 'var(--color-bg)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ color: 'white', fontSize: '1.25rem' }}>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  
          <Route path="/strava-link" element={<ProtectedRoute><StravaLink /></ProtectedRoute>} />
          <Route path="/strava-success" element={<ProtectedRoute><StravaSuccess /></ProtectedRoute>} />
          <Route path="/upload-gpx" element={<ProtectedRoute><UploadGPX /></ProtectedRoute>} />
          <Route path="/prediction-result" element={<ProtectedRoute><PredictionResult /></ProtectedRoute>} />
          <Route path="/heart-rate-zones/:activityId" element={<ProtectedRoute><HeartRateZones /></ProtectedRoute>} />
        </Routes>
        <Analytics />
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
