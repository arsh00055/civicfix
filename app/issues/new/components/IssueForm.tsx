'use client';

import React, { useState, useRef } from 'react';
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import InputField from '@/components/UI/forms/InputField';
import SelectField from '@/components/UI/forms/SelectField';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface IssueFormProps {
  formData: {
    title: string;
    description: string;
    category: string;
    priority: string;
    location: string;
    images: string[];
  };
  onUpdate: (updates: any) => void;
  onNext: () => void;
  userRole?: 'citizen' | 'volunteer' | 'admin';
  userId?: string;
}

const IssueForm: React.FC<IssueFormProps> = ({ 
  formData, 
  onUpdate, 
  onNext,
  userRole = 'citizen',
  userId
}) => {
  const [uploading, setUploading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleChange = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  const uploadImage = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('userId', userId || '');
    uploadFormData.append('type', 'issue-image');

    const response = await fetch('/api/upload/newIssue', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.data?.url || `/api/upload?userId=${userId}&imageId=${data.imageId}`;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];
      
      for (const file of validFiles) {
        const url = await uploadImage(file);
        uploadedUrls.push(url);
      }

      onUpdate({ images: [...formData.images, ...uploadedUrls] });
      toast.success(`${validFiles.length} image(s) uploaded`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = formData.images[index];
    
    try {
      const imageId = imageToRemove.split('imageId=')[1]?.split('&')[0];
      if (imageId) {
        await fetch(`/api/upload?imageId=${imageId}`, { method: 'DELETE' });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }

    const newImages = [...formData.images];
    newImages.splice(index, 1);
    onUpdate({ images: newImages });
    
    // Clear error for this index
    setImageErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
    
    toast.info('Image removed');
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.description && formData.category && formData.location) {
      onNext();
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  // Get initials from title for placeholder
  const getInitials = (imageUrl: string, index: number) => {
    if (imageErrors[index]) return '📷';
    return '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <InputField
          label="Issue Title"
          value={formData.title}
          onChange={(value) => handleChange('title', value)}
          placeholder="Briefly describe the issue"
          required
          showPasswordToggle={false}
        />

        <InputField
          label="Description"
          value={formData.description}
          onChange={(value: string) => handleChange('description', value)}
          placeholder="Provide detailed information about the issue..."
          required
          showPasswordToggle={false}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Category"
            value={formData.category}
            onChange={(value) => handleChange('category', value)}
            options={categories}
            placeholder="Select a category"
            required
          />

          <SelectField
            label="Priority"
            value={formData.priority}
            onChange={(value) => handleChange('priority', value)}
            options={priorities}
            placeholder="Select priority"
            required
          />
        </div>

        <InputField
          label="Location (General)"
          value={formData.location}
          onChange={(value) => handleChange('location', value)}
          placeholder="e.g., Main Street, Central Park, etc."
          required
          showPasswordToggle={false}
        />

        {/* Image Upload Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Images (Optional, up to 5)
          </label>
          
          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !userId || formData.images.length >= 5}
            className={`flex items-center gap-2 px-4 cursor-pointer py-2 border-2 border-dashed rounded-lg transition-colors ${
              uploading || !userId || formData.images.length >= 5
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
            }`}
          >
            <PhotoIcon className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : 'Upload Images'}
            </span>
            <span className="text-xs text-gray-400">
              ({formData.images.length}/5)
            </span>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading || !userId}
          />

          {/* Image Preview Grid - Using regular img tag */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    {imageErrors[index] ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-2xl text-gray-400">📷</span>
                      </div>
                    ) : (
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(index)}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 p-1 cursor-pointer bg-red-500 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-500">
            Supported formats: JPG, PNG, GIF. Max file size: 5MB each
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <PrimaryButton 
          type="submit" 
          role={userRole}
          disabled={uploading}
        >
          Continue to Location
        </PrimaryButton>
      </div>
    </form>
  );
};

export default IssueForm;