import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RHFInputField from '../../../components/UI/forms/RHFInputField';
import PrimaryButton from '../../../components/UI/buttons/PrimaryButton';

const volunteerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  availability: z.array(z.string()).min(1, 'Select at least one availability'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'expert']),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.experienceLevel !== undefined, {
  message: "Please select your experience level",
  path: ["experienceLevel"],
});

const SKILLS_OPTIONS = [
  'Cleaning', 'Gardening', 'Construction', 'Teaching', 'Medical',
  'Technical', 'Cooking', 'Driving', 'Organization', 'Leadership'
];

const AVAILABILITY_OPTIONS = [
  'Weekdays', 'Weekends', 'Mornings', 'Afternoons', 'Evenings', 'Flexible'
];

interface VolunteerRegistrationProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

const VolunteerRegistration: React.FC<VolunteerRegistrationProps> = ({ 
  onSuccess, 
  onSwitchToLogin 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { 
    register, 
    handleSubmit, 
    watch,
    setValue,
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      skills: [],
      availability: [],
    }
  });

  const selectedSkills = watch('skills') || [];
  const selectedAvailability = watch('availability') || [];
  const bioValue = watch('bio') || '';
  const experienceLevel = watch('experienceLevel');

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/register/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          role: 'volunteer'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    setValue('skills', newSkills);
  };

  const toggleAvailability = (availability: string) => {
    const newAvailability = selectedAvailability.includes(availability)
      ? selectedAvailability.filter(a => a !== availability)
      : [...selectedAvailability, availability];
    
    setValue('availability', newAvailability);
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Become a Volunteer</h2>
        <p className="text-gray-600 mt-2">
          Help your community by volunteering your skills and time
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <RHFInputField
            label="First Name"
            type="text"
            registration={register('firstName')}
            error={errors.firstName?.message}
            required
          />
          <RHFInputField
            label="Last Name"
            type="text"
            registration={register('lastName')}
            error={errors.lastName?.message}
            required
          />
        </div>

        <RHFInputField
          label="Email"
          type="email"
          registration={register('email')}
          error={errors.email?.message}
          required
        />

        <RHFInputField
          label="Phone (Optional)"
          type="tel"
          registration={register('phone')}
          error={errors.phone?.message}
          placeholder="+1 (555) 123-4567"
        />

        {/* Skills Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills *
            {errors.skills && (
              <span className="text-red-600 text-sm ml-2">{errors.skills.message}</span>
            )}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SKILLS_OPTIONS.map((skill) => (
              <label key={skill} className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(skill)}
                  onChange={() => toggleSkill(skill)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{skill}</span>
              </label>
            ))}
          </div>
          <input type="hidden" {...register('skills')} />
        </div>

        {/* Availability Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability *
            {errors.availability && (
              <span className="text-red-600 text-sm ml-2">{errors.availability.message}</span>
            )}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABILITY_OPTIONS.map((availability) => (
              <label key={availability} className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAvailability.includes(availability)}
                  onChange={() => toggleAvailability(availability)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{availability}</span>
              </label>
            ))}
          </div>
          <input type="hidden" {...register('availability')} />
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level *
          </label>
          <select
            {...register('experienceLevel')}
            value={experienceLevel || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select your experience level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
          {errors.experienceLevel && (
            <p className="mt-1 text-sm text-red-600">{errors.experienceLevel.message}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio (Optional)
            <span className="text-gray-500 text-xs ml-2">
              {bioValue.length}/500 characters
            </span>
          </label>
          <textarea
            {...register('bio')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Tell us about yourself, your experience, and why you want to volunteer..."
            maxLength={500}
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>

        {/* Password Fields */}
        <RHFInputField
          label="Password"
          type="password"
          registration={register('password')}
          error={errors.password?.message}
          required
          placeholder="At least 8 characters"
        />

        <RHFInputField
          label="Confirm Password"
          type="password"
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
          required
          placeholder="Confirm your password"
        />

        {/* Terms Agreement */}
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('agreeToTerms')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            I agree to the{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-red-600 text-sm">{errors.agreeToTerms.message}</p>
        )}

        <PrimaryButton
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creating Account...' : 'Become a Volunteer'}
        </PrimaryButton>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
          >
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in here
              </a>
            </p>
          </button>
        </div>
      </form>
    </div>
  );
};

export default VolunteerRegistration;