import React, { useState } from 'react';
import MapPicker from '../../../../components/map/mapPicker';
import InputField from '../../../../components/UI/forms/InputField';
import PrimaryButton from '../../../../components/UI/buttons/PrimaryButton';
import SecondaryButton from '../../../../components/UI/buttons/SecondaryButton';
import MapService from '../../../../services/mapService';

interface IssueFormData {
  title: string;
  description: string;
  category: string;
  priority: string;
  location: string;
  latitude?: number;
  longitude?: number;
  images: string[];
}

interface LocationPickerProps {
  formData: IssueFormData;
  onUpdate: (updates: Partial<IssueFormData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  formData,
  onUpdate,
  onBack,
  onSubmit,
  isSubmitting,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(
    formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : null
  );

  const handleLocationSelect = async (location: [number, number] | null) => {
    setSelectedLocation(location);
    
    if (location) {
      const [latitude, longitude] = location;
      onUpdate({ latitude, longitude });

      // Try to get address from coordinates
      try {
        const address = await MapService.reverseGeocode(latitude, longitude);
        if (address) {
          onUpdate({ location: address });
        }
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
      }
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const location: [number, number] = [latitude, longitude];
        
        setSelectedLocation(location);
        onUpdate({ latitude, longitude });

        // Get address from coordinates
        try {
          const address = await MapService.reverseGeocode(latitude, longitude);
          if (address) {
            onUpdate({ location: address });
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your current location. Please select manually on the map.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const isFormValid = formData.location.trim() && selectedLocation;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Issue Location</h2>
        <p className="text-gray-600">
          Pinpoint the exact location of the issue on the map.
        </p>
      </div>

      <div className="grid gap-6">
        <InputField
          label="Location Address"
          value={formData.location}
          onChange={(value) => onUpdate({ location: value })}
          placeholder="Address will be auto-filled when you click on the map"
          required
        />

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Select on Map *
            </label>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Use My Location
            </button>
          </div>
          
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <MapPicker setLocation={handleLocationSelect} />
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            Click on the map to mark the exact location of the issue.
            {selectedLocation && (
              <span className="text-green-600 ml-2">
                ✓ Location selected: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
              </span>
            )}
          </p>
        </div>

        {/* Issue Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Issue Preview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Title:</span>
              <span className="font-medium">{formData.title || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">{formData.category || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Priority:</span>
              <span className="font-medium capitalize">{formData.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium text-right max-w-xs">
                {formData.location || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Images:</span>
              <span className="font-medium">{formData.images.length} attached</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-200">
        <SecondaryButton onClick={onBack}>
          Back to Details
        </SecondaryButton>
        
        <PrimaryButton
          onClick={onSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Issue'}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default LocationPicker;