'use client';

import React from 'react';
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import InputField from '@/components/UI/forms/InputField';
import SelectField from '@/components/UI/forms/SelectField';

interface IssueFormProps {
  formData: {
    title: string;
    description: string;
    category: string;
    priority: string;
    location: string;
  };
  onUpdate: (updates: any) => void;
  onNext: () => void;
}

const IssueForm: React.FC<IssueFormProps> = ({ formData, onUpdate, onNext }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.description && formData.category && formData.location) {
      onNext();
    }
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
        />

        <InputField
          label="Description"
          value={formData.description}
          onChange={(value: string) => handleChange('description', value)}
          placeholder="Provide detailed information about the issue..."
          required
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
        />
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <PrimaryButton type="submit">
          Continue to Location
        </PrimaryButton>
      </div>
    </form>
  );
};

export default IssueForm;