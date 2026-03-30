'use client';

import React, { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { Issue } from '@/types/issue.types';

// Fix for default markers in react-leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface MapIssue extends Issue {
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  role?: string | null;
  issues?: MapIssue[];
  onIssueClick?: (issue: MapIssue) => void;
  onMapClick?: (lat: number, lng: number) => void;
  markers?: Array<{ lat: number; lng: number }>;
  initialCenter?: [number, number];
  zoom?: number;
  interactive?: boolean;
  getPriorityColor?: (priority: string) => string;
  getStatusColor?: (status: string) => string;
}

const createColoredPin = (color: string) => {
  if (typeof window === 'undefined') return L.icon({} as any);
  
  return L.icon({
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
};

const ClickHandler: React.FC<{ onMapClick?: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ 
  role = null, 
  issues = [], 
  onIssueClick, 
  onMapClick,
  markers = [],
  initialCenter = [30.708335, 76.690041], // Default center
  zoom = 13,
  interactive = true,
  getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  },
  getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return '#16a34a';
      case 'in_progress': return '#ca8a04';
      case 'assigned': return '#3b82f6';
      case 'reported': return '#6b7280';
      case 'closed': return '#52525b';
      default: return '#6b7280';
    }
  }
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const defaultCenter: [number, number] = initialCenter;

  const calculateCenter = useMemo((): [number, number] => {
    const validIssues = issues.filter(issue => 
      issue.latitude && issue.longitude
    );
    
    if (validIssues.length === 0 && markers.length === 0) return defaultCenter;
    
    const allPoints = [
      ...validIssues.map(issue => ({ lat: issue.latitude, lng: issue.longitude })),
      ...markers
    ];
    
    const avgLat = allPoints.reduce((sum, point) => sum + point.lat, 0) / allPoints.length;
    const avgLng = allPoints.reduce((sum, point) => sum + point.lng, 0) / allPoints.length;
    
    return [avgLat, avgLng];
  }, [issues, markers, defaultCenter]);

  const handleMarkerClick = (issue: MapIssue) => {
    if (onIssueClick) {
      onIssueClick(issue);
    }
  };

  const handlePopupClick = (issue: MapIssue, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onIssueClick) {
      onIssueClick(issue);
    }
  };

  const getMarkerColor = (issue: MapIssue): string => {
    return getPriorityColor(issue.priority);
  };

  const formatStatus = (status: string): string => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatPriority = (priority: string): string => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden">
        <MapContainer
          style={{ height: "100%", width: "100%" }}
          center={calculateCenter}
          zoom={zoom}
          scrollWheelZoom={interactive}
          className="rounded-lg"
          zoomControl={interactive}
          dragging={interactive}
          touchZoom={interactive}
          doubleClickZoom={interactive}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {interactive && onMapClick && <ClickHandler onMapClick={onMapClick} />}

          {issues.map((issue, idx) => (
            <Marker
              key={`issue-${issue.id}-${idx}`}
              position={[issue.latitude, issue.longitude]}
              icon={createColoredPin(getMarkerColor(issue))}
              eventHandlers={{
                click: () => handleMarkerClick(issue),
              }}
            >
              <Popup>
                <div className="min-w-[220px] p-2">
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
                        {issue.category.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Votes:</span>
                      <span className="font-medium text-gray-900">
                        {issue.upvotes || 0}
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
                  
                  {onIssueClick && (
                    <button
                      onClick={(e) => handlePopupClick(issue, e)}
                      className="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors font-medium"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {markers.map((marker, idx) => (
            <Marker
              key={`marker-${idx}`}
              position={[marker.lat, marker.lng]}
              icon={createColoredPin('#3b82f6')}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapComponent;