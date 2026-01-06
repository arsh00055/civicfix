'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import InputField from '@/components/UI/forms/InputField';
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import SecondaryButton from '@/components/UI/buttons/SecondaryButton';
import { usersAPI } from '@/lib/services/api/endpoints';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { UserProfile } from '@/types';
import Error from '@/app/error'

const EditProfilePage: React.FC = () => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: (currentUser as any).address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        bio: (currentUser as any).bio || '',
      });
    }
  }, [currentUser]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Fixed: use updateProfile instead of the non-existent updateUser
      const response = await usersAPI.updateProfile(formData);

      if (response.status === 200 && response.data?.success) {
        // Show success message or redirect
        router.push('/profile');
      } else {
        setError(response.data?.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('An error occurred while updating your profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const auth = useAuth();
  const role = (auth && 'role' in auth) ? (auth as any).role : undefined;

  if (!currentUser) {
    return (
      <MainLayout role={role}>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Please log in to edit your profile.</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role={currentUser?.role}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600 mt-2">
              Update your personal information and preferences
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Full Name"
                  value={formData.name || ''}
                  onChange={(value) => handleChange('name', value)}
                  required
                  disabled={saving}
                />
                <InputField
                  label="Email Address"
                  type="email"
                  value={formData.email || ''}
                  onChange={(value) => handleChange('email', value)}
                  required
                  disabled={saving}
                />
                <InputField
                  label="Phone Number"
                  value={formData.phone || ''}
                  onChange={(value) => handleChange('phone', value)}
                  placeholder="+1 (555) 123-4567"
                  disabled={saving}
                />
                <InputField
                  label="Address"
                  value={typeof formData.address === 'string' ? formData.address : formData.address?.street || ''}
                  onChange={(value) => handleChange('address', value)}
                  placeholder="123 Main St, City, State 12345"
                  disabled={saving}
                />
              </div>

              <div className="mt-6">
                <InputField
                  label="Bio"
                  value={formData.bio || ''}
                  onChange={(value) => handleChange('bio', value)}
                  placeholder="Tell us about yourself..."
                  disabled={saving}
                />
              </div>
            </div>

            {/* Profile Picture Upload (Optional) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a new profile picture (JPG, PNG, max 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-medium
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
              <div>
                <SecondaryButton
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </SecondaryButton>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={saving}
                >
                  Discard Changes
                </button>
                <PrimaryButton
                  type="submit"
                  disabled={saving}
                  isLoading={saving}
                  className="w-full sm:w-auto"
                >
                  Save Changes
                </PrimaryButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditProfilePage;