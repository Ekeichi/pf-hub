import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import StravaSuccess from './pages/StravaSuccess';
import UploadGPX from './pages/UploadGPX';
import PredictionResult from './pages/PredictionResult';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/strava-success" element={<StravaSuccess />} />
          <Route path="/upload-gpx" element={<UploadGPX />} />
          <Route path="/prediction-result" element={<PredictionResult />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
