import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import InputField from '../../components/UI/forms/InputField';
import PrimaryButton from '../../components/UI/buttons/PrimaryButton';
import SecondaryButton from '../../components/UI/buttons/SecondaryButton';

const EditProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
    bio: 'Active community member passionate about improving our neighborhood.',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update
    console.log('Profile updated:', formData);
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600 mt-2">
            Update your personal information and preferences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Full Name"
                value={formData.name}
                onChange={(value) => handleChange('name', value)}
                required
              />
              <InputField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(value) => handleChange('email', value)}
                required
              />
              <InputField
                label="Phone Number"
                value={formData.phone}
                onChange={(value) => handleChange('phone', value)}
              />
              <InputField
                label="Address"
                value={formData.address}
                onChange={(value) => handleChange('address', value)}
              />
            </div>

            <div className="mt-4">
              <InputField
                label="Bio"
                value={formData.bio}
                onChange={(value) => handleChange('bio', value)}
                placeholder="Tell us about yourself..."
              />
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
              Save Changes
            </PrimaryButton>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default EditProfile;