'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import IssueForm from './components/IssueForm';
import LocationPicker from './components/LocationPicker';
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import SecondaryButton from '@/components/UI/buttons/SecondaryButton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { issuesAPI } from '@/lib/services/api/endpoints';
import MainLayout from '@/components/layout/MainLayout';
import { useAppSelector } from '@/lib/store/hooks';

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

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      alert('Please log in to report an issue');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data for API
      const issueData = {
        ...formData,
        reporterId: user.id,
        status: 'reported',
        votes: 0,
        comments: []
      };

      const response = await issuesAPI.createIssue(issueData);
      
      alert('Issue reported successfully!');
      router.push(`/issues/${response.data.id}?role=` + (user?.role || ''));
    } catch (error) {
      console.error('Failed to submit issue:', error);
      alert('Failed to report issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get role-based color classes
  const getRoleColor = (type: 'bg' | 'text' | 'hover' | 'bg-light' | 'bg-50') => {
    const currentRole = user?.role || 'citizen';
    
    switch (currentRole) {
      case 'volunteer':
        return type === 'bg' ? 'bg-green-600' : 
               type === 'hover' ? 'hover:bg-green-700' :
               type === 'text' ? 'text-green-600' :
               type === 'bg-light' ? 'bg-green-100' :
               'bg-green-50';
      
      case 'admin':
        return type === 'bg' ? 'bg-purple-600' : 
               type === 'hover' ? 'hover:bg-purple-700' :
               type === 'text' ? 'text-purple-600' :
               type === 'bg-light' ? 'bg-purple-100' :
               'bg-purple-50';
      
      case 'citizen':
      default:
        return type === 'bg' ? 'bg-blue-600' : 
               type === 'hover' ? 'hover:bg-blue-700' :
               type === 'text' ? 'text-blue-600' :
               type === 'bg-light' ? 'bg-blue-100' :
               'bg-blue-50';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">
          You need to be logged in to report an issue.
        </p>
        <PrimaryButton onClick={() => router.push('/login')} role={user?.role as any || 'citizen'}>
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
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === currentStep 
                    ? `${getRoleColor('bg')} text-white` 
                    : step < currentStep 
                    ? `${getRoleColor('bg')} text-white`
                    : 'bg-gray-300 text-gray-700'
                }`}>
                  {step}
                </div>
                {step < 2 && (
                  <div className={`w-16 h-1 ${
                    step < currentStep ? getRoleColor('bg') : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span className={currentStep >= 1 ? `${getRoleColor('text')} font-medium` : ''}>
              Issue Details
            </span>
            <span className={currentStep >= 2 ? `${getRoleColor('text')} font-medium` : ''}>
              Location
            </span>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {currentStep === 1 && (
            <IssueForm
              formData={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              userRole={user?.role || 'citizen'}
            />
          )}

          {currentStep === 2 && (
            <LocationPicker
              formData={formData}
              onUpdate={updateFormData}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </MainLayout>  
  );
};

export default NewIssuePage;