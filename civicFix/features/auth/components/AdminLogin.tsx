'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import InputField from '@/components/UI/forms/InputField'
import PrimaryButton from '@/components/UI/buttons/PrimaryButton'
import { useAuth } from '../hooks/useAuth'

const AdminLogin: React.FC = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState('')
  const [localLoading, setLocalLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) { setError('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return }
    if (!password) { setError('Password is required.'); return }
    if (!adminKey.trim()) { setError('Admin security key is required.'); return }

    setLocalLoading(true)

    try {
      const response = await login(email, password, 'admin', { securityKey: adminKey })
      if (!response?.success) {
        setError(response?.message || 'Invalid credentials.')
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.')
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">Admin Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Email Address"
          type="email"
          value={email}
          onChange={setEmail}
          className="text-black"
          placeholder="Enter your admin email"
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
              className="text-xs text-purple-600 hover:text-purple-500 transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        <InputField
          label="Admin Security Key"
          type="password"
          value={adminKey}
          onChange={(value: string) => setAdminKey(value)}
          className="text-black"
          placeholder="Enter admin security key"
          required
          showPasswordToggle={false}
        />

        {/* Inline Error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <PrimaryButton
          type="submit"
          disabled={localLoading}
          className="w-full cursor-pointer"
          role="admin"
        >
          {localLoading ? 'Signing in...' : 'Sign in as Admin'}
        </PrimaryButton>
      </form>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          <strong>Security Note:</strong> Admin access requires special authorization. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  )
}

export default AdminLogin