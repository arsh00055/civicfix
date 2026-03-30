'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import InputField from '@/components/UI/forms/InputField'
import PrimaryButton from '@/components/UI/buttons/PrimaryButton'

const CitizenLogin: React.FC = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [localLoading, setLocalLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
  
    if (!email.trim()) { setError('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return }
    if (!password) { setError('Password is required.'); return }
    setLocalLoading(true)
  
    try {
      const response = await login(email, password, 'citizen', {})
      if (!response?.success) {
        setError(response?.message || 'Invalid email or password.')
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.')
    } finally {
      setLocalLoading(false) // ← STOP
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Citizen Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Email Address"
          type="email"
          value={email}
          onChange={(value: string) => setEmail(value)}
          className="text-black"
          placeholder="Enter your email"
          required
          showPasswordToggle={false}
        />

        <div>
          <InputField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(value: string) => setPassword(value)}
            autoComplete="current-password"
            className="text-black"
            placeholder="Enter your password"
            required
            showPasswordToggle={true}
            onTogglePassword={() => setShowPassword(!showPassword)}
            isPasswordVisible={showPassword}
          />
          <div className="text-right mt-1">
            <button
              type="button"
              onClick={() => router.push('/forgot-password')}
              className="text-xs text-blue-600 cursor-pointer hover:text-blue-500 transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Inline Error Message */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
            <span className="text-red-500 mt-0.5 flex-shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
            </span>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <PrimaryButton
          type="submit"
          disabled={localLoading}
          className="w-full cursor-pointer"
          role="citizen"
        >
          {localLoading ? 'Signing in...' : 'Sign in as Citizen'}
        </PrimaryButton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}

export default CitizenLogin