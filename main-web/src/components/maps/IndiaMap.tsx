import { useEffect, useRef } from 'react';
import { stateStats, projects } from '@/data/mockData';

interface IndiaMapProps {
  height?: string;
}

const IndiaMap = ({ height = '400px' }: IndiaMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const L = await import('leaflet');
        const { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } = await import('react-leaflet');
        
        // Fix default marker icons
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (mapRef.current) {
          // Initialize map
          const map = L.default.map(mapRef.current).setView([22.5, 82.5], 5);
          
          // Add tile layer
          L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }).addTo(map);

          // Add state markers
          stateStats.forEach(state => {
            const color = state.fairnessIndex >= 1.0 ? '#10b981' : state.fairnessIndex >= 0.7 ? '#f59e0b' : '#ef4444';
            
            L.default.circleMarker([state.coordinates.lat, state.coordinates.lng], {
              radius: Math.sqrt(state.totalCredits) / 5,
              color: color,
              fillColor: color,
              fillOpacity: 0.6,
              weight: 2
            })
            .bindPopup(`
              <div class="p-2">
                <h4 class="font-bold text-lg">${state.state}</h4>
                <div class="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>Projects: <strong>${state.totalProjects}</strong></div>
                  <div>Approved: <strong>${state.approvedProjects}</strong></div>
                  <div>Total CC: <strong>${state.totalCredits.toLocaleString()}</strong></div>
                  <div>Minted: <strong>${state.mintedCredits.toLocaleString()}</strong></div>
                  <div>Awareness: <strong>${state.awarenessIndex}%</strong></div>
                  <div>Contribution: <strong>${state.contribution}%</strong></div>
                </div>
              </div>
            `)
            .addTo(map);
          });

          // Add project markers
          projects.forEach(project => {
            const color = project.status === 'minted' ? '#10b981' : 
                         project.status === 'approved' ? '#3b82f6' : 
                         project.status === 'pending' ? '#f59e0b' : '#ef4444';
            
            L.default.circleMarker([project.coordinates.lat, project.coordinates.lng], {
              radius: 5,
              color: color,
              fillColor: color,
              fillOpacity: 0.8,
              weight: 2
            })
            .bindTooltip(`<strong>${project.farmerName}</strong><br/>${project.estimatedCredits} CC • ${project.status}`)
            .addTo(map);
          });
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initMap();
  }, []);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%' }}
      className="rounded-xl overflow-hidden border border-border"
    />
  );
};

export default IndiaMap;