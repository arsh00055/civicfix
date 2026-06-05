'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import apiClient from '@/lib/services/api/client'
import RHFInputField from '@/components/UI/forms/RHFInputField'
import PrimaryButton from '@/components/UI/buttons/PrimaryButton'
import VolunteerSuccess from './VolunteerSuccess'
import { useRegistrationSettings } from '@/lib/hooks/useRegistrationSettings'

const volunteerSchema = z.object({
  email:           z.string().email('Invalid email address'),
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName:       z.string().min(2, 'First name must be at least 2 characters'),
  lastName:        z.string().min(2, 'Last name must be at least 2 characters'),
  phone:           z.string().optional(),
  skills:          z.array(z.string()).min(1, 'Select at least one skill'),
  availability:    z.array(z.string()).min(1, 'Select at least one availability'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'expert']),
  bio:             z.string().max(500, 'Bio must be less than 500 characters').optional(),
  agreeToTerms:    z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path:    ['confirmPassword'],
})


const SKILLS_OPTIONS = Object.freeze([
  'Cleaning', 'Gardening', 'Construction', 'Teaching', 'Medical',
  'Technical', 'Cooking', 'Driving', 'Organization', 'Leadership',
])

const AVAILABILITY_OPTIONS = Object.freeze([
  'Weekdays', 'Weekends', 'Mornings', 'Afternoons', 'Evenings', 'Flexible',
])


interface VolunteerRegistrationProps {
  onSuccess:       () => void
  onSwitchToLogin: () => void
}


export default function VolunteerRegistration({
  onSuccess,
  onSwitchToLogin,
}: VolunteerRegistrationProps) {
  const [isLoading, setIsLoading]             = useState(false)
  const [error, setError]                     = useState('')
  const [showSuccess, setShowSuccess]         = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const { settings, loading: settingsLoading } = useRegistrationSettings()
  const registrationClosed = settings ? !settings.allowVolunteerRegistration : null
  const supportEmail        = settings?.supportEmail ?? 'support@civicfix.com'

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(volunteerSchema),
    defaultValues: { skills: [], availability: [] },
  })

  const selectedSkills       = watch('skills')       || []
  const selectedAvailability = watch('availability') || []
  const bioValue             = watch('bio')           || ''
  const experienceLevel      = watch('experienceLevel')

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setError('')
    try {
      const { confirmPassword, agreeToTerms, ...registrationData } = data
      await apiClient.post('/auth/register/volunteer', registrationData)
      setRegisteredEmail(data.email)
      setShowSuccess(true)
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Registration failed. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSkill = (skill: string) => {
    setValue(
      'skills',
      selectedSkills.includes(skill)
        ? selectedSkills.filter((s: string) => s !== skill)
        : [...selectedSkills, skill],
      { shouldValidate: true }
    )
  }

  const toggleAvailability = (availability: string) => {
    setValue(
      'availability',
      selectedAvailability.includes(availability)
        ? selectedAvailability.filter((a: string) => a !== availability)
        : [...selectedAvailability, availability],
      { shouldValidate: true }
    )
  }

  const handleSwitchToLogin = (e: React.MouseEvent) => {
    e.preventDefault()
    onSwitchToLogin()
  }

  // Success screen
  if (showSuccess) {
    return <VolunteerSuccess email={registeredEmail} onContinue={onSuccess} />
  }

  // Loading settings
  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    )
  }

  // Registration closed
  if (registrationClosed) {
    return (
      <div className="py-6 px-2">
        <button
          onClick={onSwitchToLogin}
          className="flex items-center cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Login
        </button>
        <div className="text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-orange-50 border-2 border-orange-100 rounded-full mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Volunteer Applications are Temporarily Closed
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
            We're not accepting new volunteer applications at the moment.
            Please try again after some time — we open registrations periodically.
          </p>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Need help?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 inline-block mb-8">
            <p className="text-xs text-gray-500 mb-1">Contact our support team</p>
            <a href={`mailto:${supportEmail}`}
              className="text-green-600 font-semibold text-sm hover:text-green-700 hover:underline transition-colors">
              {supportEmail}
            </a>
          </div>
          <button
            onClick={onSwitchToLogin}
            className="w-full bg-green-600 cursor-pointer text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors font-medium text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  // Normal registration form
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Become a Volunteer</h2>
        <p className="text-gray-600 mt-2">Help your community by volunteering your skills and time</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFInputField label="First Name" type="text" registration={register('firstName')}
            className="text-black" error={errors.firstName?.message as string} required />
          <RHFInputField label="Last Name" type="text" registration={register('lastName')}
            className="text-black" error={errors.lastName?.message as string} required />
        </div>

        <RHFInputField label="Email" type="email" registration={register('email')}
          className="text-black" error={errors.email?.message as string} required />

        <RHFInputField label="Phone (Optional)" type="tel" registration={register('phone')}
          className="text-black" error={errors.phone?.message as string} placeholder="+1 (555) 123-4567" />

        {/* Skills */}
        <div>
          <label aria-placeholder="skills" className="block text-sm font-medium text-gray-700 mb-2">
            Skills *
            {errors.skills && (
              <span className="text-red-600 text-sm ml-2">{errors.skills.message as string}</span>
            )}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {/* FIX: SKILLS_OPTIONS is a frozen module constant — stable reference */}
            {SKILLS_OPTIONS.map(skill => (
              <label key={skill} htmlFor={`skill-${skill}`}
                className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input id={`skill-${skill}`} type="checkbox"
                  checked={selectedSkills.includes(skill)} onChange={() => toggleSkill(skill)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-checked={selectedSkills.includes(skill)} />
                <span className="ml-2 text-sm text-gray-700">{skill}</span>
              </label>
            ))}
          </div>
          <input type="hidden" {...register('skills')} />
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability *
            {errors.availability && (
              <span className="text-red-600 text-sm ml-2">{errors.availability.message as string}</span>
            )}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {/* FIX: AVAILABILITY_OPTIONS is a frozen module constant — stable reference */}
            {AVAILABILITY_OPTIONS.map(availability => (
              <label key={availability} htmlFor={`availability-${availability}`}
                className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input id={`availability-${availability}`} type="checkbox"
                  checked={selectedAvailability.includes(availability)}
                  onChange={() => toggleAvailability(availability)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-checked={selectedAvailability.includes(availability)} />
                <span className="ml-2 text-sm text-gray-700">{availability}</span>
              </label>
            ))}
          </div>
          <input type="hidden" {...register('availability')} />
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level *</label>
          <select {...register('experienceLevel')} value={experienceLevel || ''}
            className="w-full px-3 py-2 border border-gray-300 cursor-pointer rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            aria-label="Select your experience level">
            <option value="">Select your experience level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
          {errors.experienceLevel && (
            <p className="mt-1 text-sm text-red-600">{errors.experienceLevel.message as string}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio (Optional)
            <span className="text-gray-500 text-xs ml-2">{bioValue.length}/500 characters</span>
          </label>
          <textarea {...register('bio')} rows={4} maxLength={500} aria-label="Volunteer bio"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Tell us about yourself, your experience, and why you want to volunteer..." />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio.message as string}</p>
          )}
        </div>

        <RHFInputField label="Password" type="password" registration={register('password')}
          className="text-black" error={errors.password?.message as string} required placeholder="At least 8 characters" />

        <RHFInputField label="Confirm Password" type="password" registration={register('confirmPassword')}
          className="text-black" error={errors.confirmPassword?.message as string} required placeholder="Confirm your password" />

        <div className="flex items-start">
          <input type="checkbox" {...register('agreeToTerms')} id="volunteerAgreeToTerms"
            className="text-black h-4 w-4 cursor-pointer text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1" />
          <label htmlFor="volunteerAgreeToTerms" className="ml-2 block text-sm text-gray-900">
            I agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">Terms and Conditions</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-red-600 text-sm">{errors.agreeToTerms.message as string}</p>
        )}

        <PrimaryButton type="submit" disabled={isLoading} className="w-full cursor-pointer">
          {isLoading ? 'Creating Account...' : 'Become a Volunteer'}
        </PrimaryButton>

        <div className="text-center pt-4 border-t border-gray-100">
          <button type="button" onClick={handleSwitchToLogin} className="text-gray-600 hover:text-gray-800">
            Already have an account?{' '}
            <span className="text-blue-600 cursor-pointer hover:text-blue-500 font-medium">Sign in here</span>
          </button>
        </div>
      </form>
    </div>
  )
}