'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import SecondaryButton from '@/components/UI/buttons/SecondaryButton';

// FIX: dynamic import with ssr:false — Leaflet uses window object which doesn't exist on server
const MapComponent = dynamic(
  () => import('@/components/map/mapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center min-h-[384px]">
        <div className="text-gray-500">Loading map...</div>
      </div>
    ),
  }
);

interface LocationPickerProps {
  formData: any;
  onUpdate: (updates: any) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  userRole?: 'citizen' | 'volunteer' | 'admin';
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  formData,
  onUpdate,
  onBack,
  onSubmit,
  isSubmitting,
  userRole = 'citizen',
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  useEffect(() => {
    if (formData.latitude && formData.longitude && !selectedLocation) {
      setSelectedLocation({
        lat: formData.latitude,
        lng: formData.longitude,
        address: formData.location || '',
      });
    }
  }, [formData, selectedLocation]);

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    onUpdate({
      latitude: location.lat,
      longitude: location.lng,
      location: location.address,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLocation) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Location on Map</h3>
          <p className="text-gray-600 mb-4">
            Click on the map to mark the exact location of the issue. The address will be auto-detected.
          </p>
        </div>

        <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
          <MapComponent
            onMapClick={(lat, lng) => handleLocationSelect({ lat, lng, address: '' })}
            initialCenter={
              formData.latitude && formData.longitude
                ? [formData.latitude, formData.longitude]
                : undefined
            }
            interactive={true}
          />
        </div>

        {selectedLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Selected Location:</strong>{' '}
              {selectedLocation.address || 'Address will be detected'}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        )}

        {!selectedLocation && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">Please click on the map to select the issue location</p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <SecondaryButton type="button" className="cursor-pointer" onClick={onBack}>
          Back to Details
        </SecondaryButton>
        <PrimaryButton
          type="submit"
          className="cursor-pointer"
          disabled={!selectedLocation || isSubmitting}
          isLoading={isSubmitting}
          role={userRole}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Issue'}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default LocationPicker;
