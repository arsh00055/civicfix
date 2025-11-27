import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IssueForm from './IssueForm';
import LocationPicker from './LocationPicker';
import PrimaryButton from '../../../../components/UI/buttons/PrimaryButton';
import SecondaryButton from '../../../../components/UI/buttons/SecondaryButton';
import { useAuth } from '../../../auth/hooks/useAuth';

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

const PostIssue: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<IssueFormData>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: '',
    images: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
    if (!isAuthenticated) {
      alert('Please log in to report an issue');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Issue submitted:', formData);
      
      // Show success message and redirect
      alert('Issue reported successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to submit issue:', error);
      alert('Failed to report issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">
          You need to be logged in to report an issue.
        </p>
        <PrimaryButton onClick={() => navigate('/login')}>
          Log In to Continue
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2].map(step => (
            <React.Fragment key={step}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step === currentStep 
                  ? 'bg-blue-600 text-white' 
                  : step < currentStep 
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 2 && (
                <div className={`w-16 h-1 ${
                  step < currentStep ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>
            Issue Details
          </span>
          <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>
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
  );
};

export default PostIssue;