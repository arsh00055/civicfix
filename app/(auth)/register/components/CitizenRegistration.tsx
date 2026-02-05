'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import RHFInputField from '@/components/UI/forms/RHFInputField'
import PrimaryButton from '@/components/UI/buttons/PrimaryButton'
import apiClient from '@/lib/services/api/client'

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
})

interface CitizenRegistrationProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export default function CitizenRegistration({ 
  onSuccess, 
  onSwitchToLogin 
}: CitizenRegistrationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(citizenSchema),
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setError('')

    try {
      // Remove confirmPassword from the data sent to API
      const { confirmPassword, agreeToTerms, ...registrationData } = data
      
      await apiClient.post('/auth/register/citizen', {
        ...registrationData,
        role: 'citizen'
      })
      
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchToLogin = (e: React.MouseEvent) => {
    e.preventDefault()
    onSwitchToLogin()
  }

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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFInputField
            label="First Name"
            type="text"
            className="text-black"
            registration={register('firstName')}
            error={errors.firstName?.message as string}
            required
          />
          <RHFInputField
            label="Last Name"
            type="text"
            className="text-black"
            registration={register('lastName')}
            error={errors.lastName?.message as string}
            required
          />
        </div>

        <RHFInputField
          label="Email"
          type="email"
          className="text-black"
          registration={register('email')}
          error={errors.email?.message as string}
          required
        />

        <RHFInputField
          label="Phone (Optional)"
          type="tel"
          registration={register('phone')}
          error={errors.phone?.message as string}
          className="text-black"
          placeholder="+1 (555) 123-4567"
        />

        <RHFInputField
          label="Address"
          type="text"
          registration={register('address')}
          error={errors.address?.message as string}
          className="text-black"
          required
          placeholder="123 Main Street"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFInputField
            label="City"
            type="text"
            registration={register('city')}
            className="text-black"
            error={errors.city?.message as string}
            required
            placeholder="New York"
          />
          <RHFInputField
            label="ZIP Code"
            type="text"
            registration={register('zipCode')}
            className="text-black"
            error={errors.zipCode?.message as string}
            required
            placeholder="10001"
          />
        </div>

        <RHFInputField
          label="Password"
          type="password"
          registration={register('password')}
          className="text-black"
          error={errors.password?.message as string}
          required
          placeholder="At least 8 characters"
        />

        <RHFInputField
          label="Confirm Password"
          type="password"
          registration={register('confirmPassword')}
          className="text-black"
          error={errors.confirmPassword?.message as string}
          required
          placeholder="Confirm your password"
        />

        <div className="flex items-start">
          <input
            type="checkbox"
            {...register('agreeToTerms')}
            className="text-black h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            id="agreeToTerms"
          />
          <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
            I agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms and Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-red-600 text-sm">{errors.agreeToTerms.message as string}</p>
        )}

        <PrimaryButton
          type="submit"
          disabled={isLoading}
          className="w-full cursor-pointer"
          isLoading={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Citizen Account'}
        </PrimaryButton>

        <div className="text-center pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleSwitchToLogin}
            className="text-gray-600 hover:text-gray-800"
          >
            Already have an account?{' '}
            <span className="text-blue-600 hover:text-blue-500 font-medium">
              Sign in here
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}