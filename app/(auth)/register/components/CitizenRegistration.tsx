'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import RHFInputField from '@/components/UI/forms/RHFInputField'
import PrimaryButton from '@/components/UI/buttons/PrimaryButton'
import apiClient from '@/lib/services/api/client'
import RegistrationSuccess from './RegistrationSuccess'
import { useRegistrationSettings } from '@/lib/hooks/useRegistrationSettings'

const citizenSchema = z.object({
  email:           z.string().email('Invalid email address'),
  password:        z.string().superRefine((val, ctx) => {
    if (val.length < 8)
      ctx.addIssue({ code: 'custom', message: 'Min 8 characters required' })
    if (!/[A-Z]/.test(val))
      ctx.addIssue({ code: 'custom', message: 'One uppercase letter required' })
    if (!/[a-z]/.test(val))
      ctx.addIssue({ code: 'custom', message: 'One lowercase letter required' })
    if (!/[0-9]/.test(val))
      ctx.addIssue({ code: 'custom', message: 'One number required' })
    if (!/[@$!%*?&]/.test(val))
      ctx.addIssue({ code: 'custom', message: 'One special character required (@$!%*?&)' })
  }),
  confirmPassword: z.string(),
  firstName:       z.string().min(2, 'First name must be at least 2 characters'),
  lastName:        z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.union([
    z.string().refine(val => /^\d{10}$/.test(val.replace(/[\s\-()]/g, '')), {
      message: 'Phone number must be exactly 10 digits',
    }),
    z.literal(''),
    z.undefined(),
  ]),
  address:      z.string().min(5, 'Address is required'),
  city:         z.string().min(2, 'City is required'),
  zipCode:      z.string().min(3, 'ZIP code is required'),
  avatar:       z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path:    ['confirmPassword'],
})

function PasswordField({ registration, error }: { registration: any, error: string | undefined }) {
  const [password, setPassword] = useState('')

  const rules = [
    { label: 'Min 8 characters',               met: password.length >= 8 },
    { label: 'One uppercase letter (A-Z)',      met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a-z)',      met: /[a-z]/.test(password) },
    { label: 'One number (0-9)',                met: /[0-9]/.test(password) },
    { label: 'One special character (@$!%*?&)', met: /[@$!%*?&]/.test(password) },
  ]

  const unmetRules = rules.filter(r => !r.met)

  return (
    <div>
      <RHFInputField
        label="Password"
        type="password"
        registration={{
          ...registration,
          onChange: (e: any) => {
            setPassword(e.target.value)
            registration.onChange(e)
          },
        }}
        className="text-black"
        error={error}
        required
        placeholder="At least 8 characters"
      />
      {password && unmetRules.length > 0 && (
        <ul className="mt-1.5 text-xs space-y-0.5 pl-1">
          {unmetRules.map(r => (
            <li key={r.label} className="text-red-400">✗ {r.label}</li>
          ))}
        </ul>
      )}
      {password && unmetRules.length === 0 && (
        <p className="mt-1.5 text-xs text-green-500 pl-1">✓ Password looks strong!</p>
      )}
    </div>
  )
}

interface CitizenRegistrationProps {
  onSuccess:       () => void
  onSwitchToLogin: () => void
}

export default function CitizenRegistration({
  onSuccess,
  onSwitchToLogin,
}: CitizenRegistrationProps) {
  const [isLoading, setIsLoading]             = useState(false)
  const [error, setError]                     = useState('')
  const [showSuccess, setShowSuccess]         = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const { settings, loading: settingsLoading } = useRegistrationSettings()
  const registrationClosed = settings ? !settings.allowCitizenRegistration : null
  const supportEmail        = settings?.supportEmail ?? 'support@civicfix.com'

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(citizenSchema),
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setError('')
    try {
      const { confirmPassword, agreeToTerms, ...registrationData } = data
      await apiClient.post('/auth/register/citizen', registrationData)
      setRegisteredEmail(data.email)
      setShowSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchToLogin = (e: React.MouseEvent) => {
    e.preventDefault()
    onSwitchToLogin()
  }

  if (showSuccess) {
    return <RegistrationSuccess email={registeredEmail} onContinue={onSuccess} />
  }

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (registrationClosed) {
    return (
      <div className="py-6 px-2">
        <div className="text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-orange-50 border-2 border-orange-100 rounded-full mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Citizen Registration is Temporarily Closed
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
            We're not accepting new citizen registrations at the moment.
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
              className="text-blue-600 font-semibold cursor-pointer text-sm hover:text-blue-700 hover:underline transition-colors">
              {supportEmail}
            </a>
          </div>
          <button onClick={onSwitchToLogin}
            className="w-full bg-blue-600 text-white cursor-pointer py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm">
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Join as Citizen</h2>
        <p className="text-gray-600 mt-2">Report issues and help improve your community</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFInputField label="First Name" placeholder="First Name" type="text" className="text-black"
            registration={register('firstName')} error={errors.firstName?.message as string} required />
          <RHFInputField label="Last Name" placeholder="Last Name" type="text" className="text-black"
            registration={register('lastName')} error={errors.lastName?.message as string} required />
        </div>

        <RHFInputField label="Email" placeholder="email" type="email" className="text-black"
          registration={register('email')} error={errors.email?.message as string} required />

        <RHFInputField
          label="Phone (Optional)" type="tel" registration={register('phone')}
          className="text-black" error={errors.phone?.message as string} placeholder="9876543210"
          maxLength={10}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight']
            if (allowed.includes(e.key)) return
            if (!/[0-9]/.test(e.key)) { e.preventDefault(); return }
            if (e.currentTarget.value.length >= 10) e.preventDefault()
          }}
        />

        <RHFInputField label="Address" type="text" registration={register('address')}
          error={errors.address?.message as string} className="text-black" required placeholder="123 Main Street" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RHFInputField label="City" type="text" registration={register('city')}
            className="text-black" error={errors.city?.message as string} required placeholder="New York" />
          <RHFInputField label="ZIP Code" type="text" registration={register('zipCode')}
            className="text-black" error={errors.zipCode?.message as string} required placeholder="10001" />
        </div>

        <PasswordField
          registration={register('password')}
          error={errors.password?.message as string | undefined}
        />

        <RHFInputField label="Confirm Password" type="password" registration={register('confirmPassword')}
          className="text-black" error={errors.confirmPassword?.message as string} required placeholder="Confirm your password" />

        <div className="flex items-start">
          <input type="checkbox" {...register('agreeToTerms')}
            className="text-black h-4 w-4 cursor-pointer text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            id="agreeToTerms" />
          <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
            I agree to the{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">Terms and Conditions</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-red-600 text-sm">{errors.agreeToTerms.message as string}</p>
        )}

        <PrimaryButton type="submit" disabled={isLoading} className="w-full cursor-pointer" isLoading={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Citizen Account'}
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