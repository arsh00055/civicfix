import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RHFInputField from '../../../components/UI/forms/RHFInputField';
import PrimaryButton from '../../../components/UI/buttons/PrimaryButton';

const citizenSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  zipCode: z.string().min(3, 'ZIP code is required'),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface CitizenRegistrationProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

const CitizenRegistration: React.FC<CitizenRegistrationProps> = ({ 
  onSuccess, 
  onSwitchToLogin 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(citizenSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/register/citizen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          role: 'citizen'
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

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Join as Citizen</h2>
        <p className="text-gray-600 mt-2">
          Report issues and help improve your community
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

        <RHFInputField
          label="Address"
          type="text"
          registration={register('address')}
          error={errors.address?.message}
          required
          placeholder="123 Main Street"
        />

        <div className="grid grid-cols-2 gap-4">
          <RHFInputField
            label="City"
            type="text"
            registration={register('city')}
            error={errors.city?.message}
            required
            placeholder="New York"
          />
          <RHFInputField
            label="ZIP Code"
            type="text"
            registration={register('zipCode')}
            error={errors.zipCode?.message}
            required
            placeholder="10001"
          />
        </div>

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
          {isLoading ? 'Creating Account...' : 'Create Citizen Account'}
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

export default CitizenRegistration;