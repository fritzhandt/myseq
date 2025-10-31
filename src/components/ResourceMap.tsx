import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Phone, Mail, MapPin } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Resource {
  id: string;
  organization_name: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  categories: string[];
  latitude?: number;
  longitude?: number;
  logo_url?: string;
}

interface ResourceMapProps {
  resources: Resource[];
  onResourceClick?: (resourceId: string) => void;
}

// Category color mapping
const categoryColors: Record<string, string> = {
  'Education & Youth': '#3b82f6', // blue
  'Health & Wellness': '#10b981', // green
  'Senior Services': '#f59e0b', // amber
  'Arts & Culture': '#8b5cf6', // purple
  'Sports & Recreation': '#ef4444', // red
  'Business & Employment': '#06b6d4', // cyan
  'Legal & Advocacy': '#ec4899', // pink
  'Housing & Development': '#14b8a6', // teal
  'Faith-Based': '#6366f1', // indigo
  'Community Services': '#f97316', // orange
};

// Create custom colored markers based on category
const createCategoryIcon = (category: string) => {
  const color = categoryColors[category] || '#6366f1';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

// Component to auto-fit bounds
function FitBounds({ resources }: { resources: Resource[] }) {
  const map = useMap();

  useEffect(() => {
    if (resources.length > 0) {
      const bounds = L.latLngBounds(
        resources
          .filter(r => r.latitude !== undefined && r.longitude !== undefined)
          .map(r => [r.latitude!, r.longitude!])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [resources, map]);

  return null;
}

export default function ResourceMap({ resources, onResourceClick }: ResourceMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Filter resources that have valid coordinates
  const mappableResources = resources.filter(
    r => r.latitude !== undefined && r.latitude !== null && 
         r.longitude !== undefined && r.longitude !== null &&
         !isNaN(r.latitude) && !isNaN(r.longitude)
  );

  // Default center: Southeast Queens, NY
  const defaultCenter: [number, number] = [40.6782, -73.7442];

  if (mappableResources.length === 0) {
    return (
      <Card className="p-8">
        <CardContent className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">
            No resources with location data found for current filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border shadow-lg">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds resources={mappableResources} />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
        >
          {mappableResources.map((resource) => (
            <Marker
              key={resource.id}
              position={[resource.latitude!, resource.longitude!]}
              icon={createCategoryIcon(resource.categories[0] || 'Community Services')}
            >
              <Popup maxWidth={300} minWidth={250}>
                <div className="p-2">
                  <h3 className="font-semibold text-lg mb-2">
                    {resource.organization_name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {resource.description}
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-1 mb-3 text-sm">
                    {resource.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{resource.address}</span>
                      </div>
                    )}
                    {resource.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <a href={`tel:${resource.phone}`} className="text-primary hover:underline">
                          {resource.phone}
                        </a>
                      </div>
                    )}
                    {resource.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <a href={`mailto:${resource.email}`} className="text-primary hover:underline">
                          {resource.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource.categories.slice(0, 2).map((cat, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${categoryColors[cat] || '#6366f1'}20`,
                          color: categoryColors[cat] || '#6366f1',
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                    {resource.categories.length > 2 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        +{resource.categories.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Website Link */}
                  {resource.website && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(resource.website, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
