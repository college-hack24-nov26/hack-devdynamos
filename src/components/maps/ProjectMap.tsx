import { useEffect, useRef } from 'react';
import { Project } from '@/data/mockData';

interface ProjectMapProps {
  project: Project;
  height?: string;
}

const ProjectMap = ({ project, height = '300px' }: ProjectMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const L = await import('leaflet');
        
        // Fix default marker icons
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (mapRef.current) {
          // Initialize map
          const map = L.default.map(mapRef.current).setView([project.coordinates.lat, project.coordinates.lng], 14);
          
          // Add tile layer
          L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }).addTo(map);

          // Add marker for the project location
          L.default.marker([project.coordinates.lat, project.coordinates.lng])
            .bindPopup(`
              <div class="text-sm">
                <strong>${project.farmerName}</strong><br/>
                ${project.landArea} hectares<br/>
                ${project.district}, ${project.state}
              </div>
            `)
            .addTo(map);

          // Add circle to represent land area
          L.default.circle([project.coordinates.lat, project.coordinates.lng], {
            radius: Math.sqrt(project.landArea * 10000) * 10,
            color: 'hsl(160, 84%, 28%)',
            fillColor: 'hsl(160, 84%, 28%)',
            fillOpacity: 0.3
          }).addTo(map);
        }
      } catch (error) {
        console.error('Failed to initialize project map:', error);
      }
    };

    initMap();
  }, [project]);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%' }}
      className="rounded-xl overflow-hidden border border-border"
    />
  );
};

export default ProjectMap;