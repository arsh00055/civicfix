'use client';

import React from 'react';
import { 
  PlusIcon, 
  MinusIcon, 
  LocationMarkerIcon,
  FilterIcon 
} from '@/components/UI/icons';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  onFilterClick: () => void;
  currentZoom: number;
  isLocating: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onLocate,
  onFilterClick,
  currentZoom,
  isLocating,
}) => {
  return (
    <div className="absolute top-4 right-4 space-y-2 z-10">
      {/* Zoom Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={onZoomIn}
          disabled={currentZoom >= 18}
          className="flex items-center justify-center w-10 h-10 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Zoom in"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
        <div className="border-t border-gray-200">
          <button
            onClick={onZoomOut}
            disabled={currentZoom <= 1}
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom out"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Location Button */}
      <button
        onClick={onLocate}
        disabled={isLocating}
        className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Find my location"
      >
        {isLocating ? (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <LocationMarkerIcon className="h-4 w-4" />
        )}
      </button>

      {/* Filter Button */}
      <button
        onClick={onFilterClick}
        className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Filter issues"
      >
        <FilterIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default MapControls;