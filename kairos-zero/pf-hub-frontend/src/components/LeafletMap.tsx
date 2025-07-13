import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface GPXPoint {
  lat: number;
  lon: number;
  ele: number;
}

interface LeafletMapProps {
  gpxData: GPXPoint[];
  width?: number;
  height?: number;
}

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LeafletMap: React.FC<LeafletMapProps> = ({ gpxData, width = 800, height = 400 }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current || gpxData.length === 0) return;

    // Calculer les limites du parcours
    const lats = gpxData.map(p => p.lat);
    const lons = gpxData.map(p => p.lon);
    
    const bounds = [
      [Math.min(...lats), Math.min(...lons)],
      [Math.max(...lats), Math.max(...lons)]
    ];

    // Créer la carte
    map.current = L.map(mapContainer.current).fitBounds(bounds as L.LatLngBoundsExpression);

    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Créer les coordonnées pour la ligne
    const coordinates = gpxData.map(point => [point.lat, point.lon] as [number, number]);
    
    // Ajouter la ligne de parcours
    L.polyline(coordinates, {
      color: '#0066cc',
      weight: 4,
      opacity: 0.8
    }).addTo(map.current);

    // Ajouter les points de contrôle
    const controlPoints = gpxData.filter((_, index) => 
      index === 0 || 
      index === gpxData.length - 1 || 
      index % Math.max(1, Math.floor(gpxData.length / 10)) === 0
    );

    controlPoints.forEach((point, index) => {
      const color = index === 0 ? '#00ff00' : 
                   index === controlPoints.length - 1 ? '#ff0000' : '#ffff00';
      
      // Créer une icône personnalisée
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 12px; 
          height: 12px; 
          background-color: ${color}; 
          border: 2px solid white; 
          border-radius: 50%; 
          box-shadow: 0 0 4px rgba(0,0,0,0.5);
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker([point.lat, point.lon], { icon })
        .addTo(map.current!);

      // Ajouter une popup avec l'altitude
      const popupContent = `
        <div style="padding: 8px;">
          <strong>${index === 0 ? 'Départ' : index === controlPoints.length - 1 ? 'Arrivée' : 'Point de contrôle'}</strong><br>
          Altitude: ${Math.round(point.ele)}m
        </div>
      `;
      
      marker.bindPopup(popupContent);
    });

    // Nettoyer à la destruction
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [gpxData]);

  if (gpxData.length === 0) {
    return (
      <div style={{ 
        width, 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f5f5f5'
      }}>
        <p>Aucune donnée GPX disponible</p>
      </div>
    );
  }

  return (
    <div style={{ 
      width, 
      height, 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {/* Légende */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '12px',
        color: 'black',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        <div style={{ marginBottom: '6px', fontWeight: 'bold' }}>Légende</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '2px', backgroundColor: '#0066cc' }}></div>
          <span>Parcours GPX</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00ff00' }}></div>
          <span>Départ</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff0000' }}></div>
          <span>Arrivée</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffff00' }}></div>
          <span>Points de contrôle</span>
        </div>
      </div>
    </div>
  );
};

export default LeafletMap; 