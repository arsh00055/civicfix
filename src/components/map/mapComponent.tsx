import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/index.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Issue } from "../../types";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createColoredPin = (color: string) =>
  L.icon({
    iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <path fill="${color}" d="M16 0C9 0 4 6 4 12c0 8 12 20 12 20s12-12 12-20c0-6-5-12-12-12z"/>
        <circle cx="16" cy="12" r="5" fill="white"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  });

interface MapIssue extends Issue {
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  role: string | null;
  issues: MapIssue[];
  onIssueClick: (issue: MapIssue) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  role, 
  issues, 
  onIssueClick, 
  getPriorityColor, 
  getStatusColor 
}) => {
  // Default center coordinates (you can make this dynamic based on issues)
  const defaultCenter: [number, number] = [30.708335, 76.690041];
  
  // Calculate center based on issues if available
  const calculateCenter = (): [number, number] => {
    if (issues.length === 0) return defaultCenter;
    
    const validIssues = issues.filter(issue => 
      issue.latitude && issue.longitude
    );
    
    if (validIssues.length === 0) return defaultCenter;
    
    const avgLat = validIssues.reduce((sum, issue) => sum + issue.latitude, 0) / validIssues.length;
    const avgLng = validIssues.reduce((sum, issue) => sum + issue.longitude, 0) / validIssues.length;
    
    return [avgLat, avgLng];
  };

  const handleMarkerClick = (issue: MapIssue) => {
    onIssueClick(issue);
  };

  const handlePopupClick = (issue: MapIssue, e: React.MouseEvent) => {
    e.stopPropagation();
    onIssueClick(issue);
  };

  const getMarkerColor = (issue: MapIssue): string => {
    // Use priority for color coding (you can change this to status if preferred)
    return getPriorityColor(issue.priority);
  };

  const formatStatus = (status: string): string => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatPriority = (priority: string): string => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div className="w-full h-full">
      <div className="w-full h-full bg-gray-50">
        <MapContainer
          style={{ height: "100%", width: "100%" }}
          center={calculateCenter()}
          zoom={issues.length > 0 ? 13 : 12}
          scrollWheelZoom={true}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {issues.map((issue, idx) => (
            <Marker
              key={`${issue.id}-${idx}`}
              position={[issue.latitude, issue.longitude]}
              icon={createColoredPin(getMarkerColor(issue))}
              eventHandlers={{
                click: () => handleMarkerClick(issue),
              }}
            >
              <Popup>
                <div className="min-w-[200px] p-2">
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                    {issue.title}
                  </h3>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span 
                        className="font-medium px-2 py-1 rounded-full text-xs"
                        style={{ 
                          backgroundColor: `${getStatusColor(issue.status)}20`,
                          color: getStatusColor(issue.status),
                          border: `1px solid ${getStatusColor(issue.status)}40`
                        }}
                      >
                        {formatStatus(issue.status)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Priority:</span>
                      <span 
                        className="font-medium px-2 py-1 rounded-full text-xs"
                        style={{ 
                          backgroundColor: `${getMarkerColor(issue)}20`,
                          color: getMarkerColor(issue),
                          border: `1px solid ${getMarkerColor(issue)}40`
                        }}
                      >
                        {formatPriority(issue.priority)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {issue.category}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Votes:</span>
                      <span className="font-medium text-gray-900">
                        {issue.votes || 0}
                      </span>
                    </div>
                    
                    {issue.location && (
                      <div className="mt-2">
                        <span className="text-gray-600 text-xs">Location:</span>
                        <p className="text-gray-700 text-xs mt-1 line-clamp-2">
                          {issue.location}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => handlePopupClick(issue, e)}
                    className="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors font-medium"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapComponent;