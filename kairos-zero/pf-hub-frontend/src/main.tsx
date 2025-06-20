import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import StravaSuccess from "./pages/StravaSuccess"
import PredictionResult from "./pages/PredictionResult"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/strava-success" element={<StravaSuccess />} />
        <Route path="/prediction-result" element={<PredictionResult />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)



