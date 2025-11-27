import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import InputField from '../../components/UI/forms/InputField';
import SelectField from '../../components/UI/forms/SelectField';
import PrimaryButton from '../../components/UI/buttons/PrimaryButton';
import SecondaryButton from '../../components/UI/buttons/SecondaryButton';

const ReportIssuePage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    priority: 'medium',
    location: '',
  });

  const categories = [
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'safety', label: 'Safety' },
    { value: 'environment', label: 'Environment' },
    { value: 'other', label: 'Other' },
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle issue submission
    console.log('Issue reported:', formData);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
          <p className="text-gray-600 mt-2">
            Help improve our community by reporting issues that need attention
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Issue Details</h2>
            
            <div className="space-y-4">
              <InputField
                label="Issue Title"
                value={formData.title}
                onChange={(value) => handleChange('title', value)}
                placeholder="Brief description of the issue"
                required
              />

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
                required
              />

              <InputField
                label="Location"
                value={formData.location}
                onChange={(value) => handleChange('location', value)}
                placeholder="Where is this issue located?"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Please provide detailed information about the issue..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <SecondaryButton
              type="button"
              onClick={() => window.history.back()}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit">
              Submit Issue
            </PrimaryButton>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default ReportIssuePage;