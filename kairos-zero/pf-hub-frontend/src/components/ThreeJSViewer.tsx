import { useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface GPXPoint {
  lat: number;
  lon: number;
  ele: number;
}

interface ThreeJSViewerProps {
  gpxData: GPXPoint[];
  width?: number;
  height?: number;
  onError?: (error: string) => void;
}

// Composant pour la ligne de parcours 3D simplifié
function GPXTrack({ points }: { points: GPXPoint[] }) {
  const lineGeometry = useMemo(() => {
    if (points.length < 2) return null;

    try {
      // Calculer les limites
      const lats = points.map(p => p.lat);
      const lons = points.map(p => p.lon);
      const eles = points.map(p => p.ele);
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);
      const minEle = Math.min(...eles);
      const maxEle = Math.max(...eles);

      // Facteur d'exagération pour l'altitude (plus visible)
      const elevationScale = 8;
      
      // Créer les points 3D avec couleurs selon l'altitude
      const positions: number[] = [];
      const colors: number[] = [];
      
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        
        // Normaliser les coordonnées avec une échelle plus petite
        const x = ((point.lon - minLon) / (maxLon - minLon)) * 50 - 25;
        const z = ((point.lat - minLat) / (maxLat - minLat)) * 50 - 25;
        const y = ((point.ele - minEle) / (maxEle - minEle)) * elevationScale;
        
        positions.push(x, y, z);
        
        // Couleur selon l'altitude (vert pour bas, rouge pour haut)
        const altitudeRatio = (point.ele - minEle) / (maxEle - minEle);
        if (altitudeRatio < 0.5) {
          // Vert vers jaune
          colors.push(0, altitudeRatio * 2, 1 - altitudeRatio * 2);
        } else {
          // Jaune vers rouge
          colors.push((altitudeRatio - 0.5) * 2, 1 - (altitudeRatio - 0.5) * 2, 0);
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      return geometry;
    } catch (error) {
      console.error('Erreur lors de la création de la géométrie:', error);
      return null;
    }
  }, [points]);

  if (!lineGeometry) return null;

  return (
    <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 25 }))} />
  );
}

// Composant pour les points de départ et d'arrivée
function StartEndPoints({ points }: { points: GPXPoint[] }) {
  if (points.length < 2) return null;

  const lats = points.map(p => p.lat);
  const lons = points.map(p => p.lon);
  const eles = points.map(p => p.ele);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minEle = Math.min(...eles);
  const maxEle = Math.max(...eles);

  // Point de départ
  const startPoint = points[0];
  const startX = ((startPoint.lon - minLon) / (maxLon - minLon)) * 50 - 25;
  const startY = ((startPoint.ele - minEle) / (maxEle - minEle)) * 8;
  const startZ = ((startPoint.lat - minLat) / (maxLat - minLat)) * 50 - 25;

  // Point d'arrivée
  const endPoint = points[points.length - 1];
  const endX = ((endPoint.lon - minLon) / (maxLon - minLon)) * 50 - 25;
  const endY = ((endPoint.ele - minEle) / (maxEle - minEle)) * 8;
  const endZ = ((endPoint.lat - minLat) / (maxLat - minLat)) * 50 - 25;

  return (
    <>
      {/* Point de départ (vert) */}
      <mesh position={[startX, startY, startZ]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
      
      {/* Point d'arrivée (rouge) */}
      <mesh position={[endX, endY, endZ]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
    </>
  );
}

// Composant principal Three.js simplifié
function ThreeJSViewer({ gpxData, onError }: ThreeJSViewerProps) {
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Détecter si on est sur mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (hasError && onError) {
      onError('Erreur lors du rendu 3D');
    }
  }, [hasError, onError]);

  if (hasError) {
    return null;
  }

  return (
    <Canvas
      camera={{ 
        position: isMobile ? [20, 15, 20] : [30, 20, 30], 
        fov: isMobile ? 70 : 60 
      }}
      style={{ background: 'linear-gradient(to bottom, #1a1a2e, #16213e)' }}
      onError={(error) => {
        console.error('Erreur Canvas Three.js:', error);
        setHasError(true);
      }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      
      {/* Grille de référence plus petite */}
      <gridHelper args={[50, 10, '#666666', '#999999']} />
      
      {/* Ligne de parcours */}
      <GPXTrack points={gpxData} />
      
      {/* Points de départ et d'arrivée */}
      <StartEndPoints points={gpxData} />
      
      {/* Contrôles de caméra optimisés pour mobile */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={isMobile ? 60 : 100}
        minDistance={isMobile ? 8 : 5}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={isMobile ? 0.5 : 1}
        zoomSpeed={isMobile ? 0.8 : 1}
        panSpeed={isMobile ? 0.8 : 1}

      />
      
    </Canvas>
  );
}

export default ThreeJSViewer; 