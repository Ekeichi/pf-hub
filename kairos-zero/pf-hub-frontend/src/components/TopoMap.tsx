import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface GPXPoint {
  lat: number;
  lon: number;
  ele: number;
}

interface TopoMapProps {
  gpxData: GPXPoint[];
  width?: number;
  height?: number;
}

// Clé Mapbox publique simple
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

const TopoMap: React.FC<TopoMapProps> = ({ gpxData, width = 800, height = 400 }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Calculer les limites du parcours
    if (gpxData.length === 0) return;

    try {
      const lats = gpxData.map(p => p.lat);
      const lons = gpxData.map(p => p.lon);
      
      const bounds = [
        [Math.min(...lons), Math.min(...lats)], // sud-ouest
        [Math.max(...lons), Math.max(...lats)]  // nord-est
      ];

      // Créer la carte simple
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v12', // Style topographique
        bounds: bounds as mapboxgl.LngLatBoundsLike,
        fitBoundsOptions: {
          padding: 50,
          maxZoom: 15
        }
      });

      // Attendre que la carte soit chargée
      map.current.on('load', () => {
        setMapLoaded(true);
        
        if (map.current) {
          // Créer les coordonnées pour la ligne
          const coordinates = gpxData.map(point => [point.lon, point.lat]);
          
          // Ajouter la source de données GPX
          map.current.addSource('gpx-track', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: coordinates
              }
            }
          });

          // Ajouter la couche de ligne
          map.current.addLayer({
            id: 'gpx-line',
            type: 'line',
            source: 'gpx-track',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#0066cc',
              'line-width': 4,
              'line-opacity': 0.8
            }
          });

          // Ajouter les points de contrôle
          const controlPoints = gpxData.filter((_, index) => 
            index === 0 || 
            index === gpxData.length - 1 || 
            index % Math.max(1, Math.floor(gpxData.length / 10)) === 0
          );

          controlPoints.forEach((point, index) => {
            const color = index === 0 ? '#00ff00' : 
                         index === controlPoints.length - 1 ? '#ff0000' : '#ffff00';
            
            // Créer un marqueur simple
            const el = document.createElement('div');
            el.style.width = '12px';
            el.style.height = '12px';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = color;
            el.style.border = '2px solid white';
            el.style.boxShadow = '0 0 4px rgba(0,0,0,0.5)';

            const marker = new mapboxgl.Marker(el)
              .setLngLat([point.lon, point.lat])
              .addTo(map.current!);

            // Ajouter une popup avec l'altitude
            const popup = new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 8px;">
                  <strong>${index === 0 ? 'Départ' : index === controlPoints.length - 1 ? 'Arrivée' : 'Point de contrôle'}</strong><br>
                  Altitude: ${Math.round(point.ele)}m
                </div>
              `);

            marker.setPopup(popup);
          });

          // Ajouter des contrôles de navigation
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
        }
      });

      // Gérer les erreurs
      map.current.on('error', (e) => {
        console.error('Erreur Mapbox:', e);
        setError('Erreur lors du chargement de la carte');
      });

    } catch (err) {
      console.error('Erreur lors de l\'initialisation de la carte:', err);
      setError('Erreur lors de l\'initialisation de la carte');
    }

    // Nettoyer à la destruction
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [gpxData]);

  if (error) {
    return (
      <div style={{ 
        width, 
        height, 
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
          La carte topographique n'est pas disponible
        </p>
      </div>
    );
  }

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
        zIndex: 10,
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

export default TopoMap; 