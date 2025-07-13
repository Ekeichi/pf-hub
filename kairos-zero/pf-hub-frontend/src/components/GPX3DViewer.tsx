import React, { Suspense, useEffect, useState } from 'react';

interface GPXPoint {
  lat: number;
  lon: number;
  ele: number;
}

interface GPX3DViewerProps {
  gpxData: GPXPoint[];
  width?: number;
  height?: number;
}

// Composant de chargement conditionnel pour Three.js
const ThreeJSViewer = React.lazy(() => import('./ThreeJSViewer'));

// Composant principal du viewer
function GPX3DViewer({ gpxData, width = 400, height = 300 }: GPX3DViewerProps) {
  const [webGLAvailable, setWebGLAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Vérifier si WebGL est disponible
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebGLAvailable(false);
      setError('WebGL is not supported by your browser');
    }

    // Détecter si on est sur mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: isMobile ? '250px' : height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f5f5f5',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>
        <p style={{ fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
          3D visualization is not available
        </p>
      </div>
    );
  }

  if (gpxData.length === 0) {
    return (
      <div style={{ 
        width: '100%', 
        height: isMobile ? '250px' : height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f5f5f5'
      }}>
        <p>No GPX data available</p>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      height: isMobile ? '250px' : height, 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Suspense fallback={
        <div style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <p>Loading 3D visualization...</p>
        </div>
      }>
        <ThreeJSViewer 
          gpxData={gpxData} 
          width={isMobile ? window.innerWidth - 40 : width} 
          height={isMobile ? 250 : height} 
        />
      </Suspense>
      
      {/* Légende adaptée pour mobile */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? '5px' : '10px',
        left: isMobile ? '5px' : '10px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: isMobile ? '8px' : '12px',
        borderRadius: '6px',
        fontSize: isMobile ? '10px' : '12px',
        color: 'black',
        zIndex: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        maxWidth: isMobile ? '120px' : 'auto'
      }}>
        <div style={{ 
          marginBottom: isMobile ? '4px' : '6px', 
          fontWeight: 'bold',
          fontSize: isMobile ? '9px' : '12px'
        }}>
          3D Visualization
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          marginBottom: '4px' 
        }}>
          <div style={{ 
            width: isMobile ? '8px' : '12px', 
            height: '2px', 
            background: 'linear-gradient(to right, #00ff00, #ffff00, #ff0000)' 
          }}></div>
          <span style={{ fontSize: isMobile ? '8px' : '12px' }}>Route altitude</span>
        </div>
      </div>
    </div>
  );
}

export default GPX3DViewer; 