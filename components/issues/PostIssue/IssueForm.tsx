'use client';

import React, { useState } from 'react';
import InputField from '@/components/UI/forms/InputField';
import SelectField from '@/components/UI/forms/SelectField';
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import useImageService from '@/lib/services/imageService';

interface IssueFormData {
  title: string;
  description: string;
  category: string;
  priority: string;
  location: string;
  images: File[];
  imageUrls?: string[];
}

interface IssueFormProps {
  formData: IssueFormData;
  onUpdate: (updates: Partial<IssueFormData>) => void;
  onNext: () => void;
}

const IssueForm: React.FC<IssueFormProps> = ({ formData, onUpdate, onNext }) => {
  const [imageUploading, setImageUploading] = useState(false);
  const imageService = useImageService;

  const categories = [
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'safety', label: 'Safety' },
    { value: 'environment', label: 'Environment' },
    { value: 'public_services', label: 'Public Services' },
    { value: 'other', label: 'Other' },
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setImageUploading(true);
    try {
      const newFiles: File[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate image
        const validation = await imageService.validateImage(file);
        if (!validation.isValid) {
          alert(validation.message);
          continue;
        }

        // Compress image
        const compressedFile = await imageService.compressImage(file);
        newFiles.push(compressedFile);
      }

      onUpdate({
        images: [...formData.images, ...newFiles]
      });
    } catch (error) {
      console.error('Image processing failed:', error);
      alert('Failed to process images. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    onUpdate({ images: newImages });
  };

  const createImagePreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const isFormValid = formData.title.trim() && 
                     formData.description.trim() && 
                     formData.category && 
                     formData.location.trim();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Report an Issue</h2>
        <p className="text-gray-600">
          Provide details about the issue you've encountered in your community.
        </p>
      </div>

      <div className="grid gap-6">
        <InputField
          label="Issue Title"
          value={formData.title}
          onChange={(value) => onUpdate({ title: value })}
          placeholder="Brief, descriptive title for the issue"
          required showPasswordToggle={false}        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Provide detailed information about the issue..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Category"
            value={formData.category}
            onChange={(value) => onUpdate({ category: value })}
            options={categories}
            placeholder="Select a category"
            required
          />

          <SelectField
            label="Priority"
            value={formData.priority}
            onChange={(value) => onUpdate({ priority: value })}
            options={priorities}
            required
          />
        </div>

        <InputField
          label="Location Description"
          value={formData.location}
          onChange={(value) => onUpdate({ location: value })}
          placeholder="Street address, landmark, or area description"
          required showPasswordToggle={false}        />

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attach Images (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Choose Images</span>
              {imageUploading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Upload up to 5 images (JPEG, PNG, GIF, WebP). Max 5MB each.
            </p>
          </div>

          {/* Image Previews */}
          {formData.images.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Attached Images:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={createImagePreviewUrl(image)}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute cursor-pointer  -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <PrimaryButton
          onClick={onNext}
          disabled={!isFormValid}
        >
          Next: Set Location
        </PrimaryButton>
      </div>
    </div>
  );
};

export default IssueForm;