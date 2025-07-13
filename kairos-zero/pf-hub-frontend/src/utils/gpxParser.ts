export interface GPXPoint {
  lat: number;
  lon: number;
  ele: number;
}

export function parseGPXData(gpxContent: string): GPXPoint[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxContent, 'text/xml');
  
  const trackPoints: GPXPoint[] = [];
  
  // Chercher les points de track (trkpt)
  const trackPointsElements = xmlDoc.querySelectorAll('trkpt');
  
  trackPointsElements.forEach((pointElement) => {
    const lat = parseFloat(pointElement.getAttribute('lat') || '0');
    const lon = parseFloat(pointElement.getAttribute('lon') || '0');
    
    // Chercher l'élévation dans l'élément enfant <ele>
    const eleElement = pointElement.querySelector('ele');
    const ele = eleElement ? parseFloat(eleElement.textContent || '0') : 0;
    
    if (!isNaN(lat) && !isNaN(lon)) {
      trackPoints.push({ lat, lon, ele });
    }
  });
  
  return trackPoints;
}

export function parseGPXFromFile(file: File): Promise<GPXPoint[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const points = parseGPXData(content);
        resolve(points);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier GPX'));
    };
    
    reader.readAsText(file);
  });
} 