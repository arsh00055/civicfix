'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import IssueForm from './components/IssueForm';
import LocationPicker from './components/LocationPicker';
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { issuesAPI } from '@/lib/services/api/endpoints';
import MainLayout from '@/components/layout/MainLayout';
import { useAppSelector } from '@/lib/store/hooks';
import { toast } from 'sonner';

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

const NewIssuePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const userRole = useAppSelector((state) => state.auth.role);
  const [formData, setFormData] = useState<IssueFormData>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: '',
    images: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const updateFormData = (updates: Partial<IssueFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      toast.warning('Please log in to report an issue');
      router.push('/login');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.warning('Please select a location on the map');
      return;
    }

    setIsSubmitting(true);
    try {

      let finalLocation = formData.location;
      if (!finalLocation && formData.latitude && formData.longitude) {
        finalLocation = `${formData.latitude}, ${formData.longitude}`;
      }

      const issueData = {
        title:       formData.title,
        description: formData.description,
        category:    formData.category,
        priority:    formData.priority,
        location:    finalLocation,
        latitude:    formData.latitude,
        longitude:   formData.longitude,
        images:      formData.images,
        reporterId:  user.id,
        status:      'reported',
      };

      const response = await issuesAPI.createIssue(issueData);
      const created = response.data?.id ? response.data : response.data?.data;
      const newId = created?.id || created?._id;

      toast.success('Issue reported successfully!');
      router.push(`/issues/${newId}?role=${user?.role || ''}`);
    } catch (error: any) {
      console.error('Failed to submit issue:', error);
      toast.error(error.message || 'Failed to report issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Role-aware colour helpers
  const currentRole = user?.role || 'citizen';
  const roleColors = {
    volunteer: { bg: 'bg-green-600',  hover: 'hover:bg-green-700',  text: 'text-green-600',  light: 'bg-green-100',  faint: 'bg-green-50'  },
    admin:     { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', text: 'text-purple-600', light: 'bg-purple-100', faint: 'bg-purple-50' },
    citizen:   { bg: 'bg-blue-600',   hover: 'hover:bg-blue-700',   text: 'text-blue-600',   light: 'bg-blue-100',   faint: 'bg-blue-50'   },
  };
  const c = roleColors[currentRole as keyof typeof roleColors] ?? roleColors.citizen;

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to report an issue.</p>
        <PrimaryButton onClick={() => router.push('/login')} role={(user?.role as any) || 'citizen'}>
          Log In to Continue
        </PrimaryButton>
      </div>
    );
  }

  return (
    <MainLayout role={userRole}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report an Issue</h1>
          <p className="text-gray-600">
            Help improve your community by reporting issues that need attention
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2].map(step => (
              <React.Fragment key={step}>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm ${
                    step <= currentStep ? `${c.bg} text-white` : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {step}
                </div>
                {step < 2 && (
                  <div className={`w-16 h-1 ${step < currentStep ? c.bg : 'bg-gray-300'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 max-w-[8rem] mx-auto">
            <span className={currentStep >= 1 ? `${c.text} font-medium` : ''}>Details</span>
            <span className={currentStep >= 2 ? `${c.text} font-medium` : ''}>Location</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {currentStep === 1 && (
            <IssueForm
              formData={formData}
              onUpdate={updateFormData}
              onNext={() => setCurrentStep(2)}
              userRole={currentRole as 'citizen' | 'volunteer' | 'admin'}
              userId={user?.id}
            />
          )}
          {currentStep === 2 && (
            <LocationPicker
              formData={formData}
              onUpdate={updateFormData}
              onBack={() => setCurrentStep(1)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              userRole={currentRole as 'citizen' | 'volunteer' | 'admin'}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default NewIssuePage;