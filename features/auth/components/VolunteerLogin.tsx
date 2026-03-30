'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/components/UI/forms/InputField';
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import { useAuth } from '../hooks/useAuth';

const VolunteerLogin: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState<string>('');
  const [localLoading, setLocalLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorCode('');

    if (!email.trim()) { setError('Email is required.'); return }
    if (!password) { setError('Password is required.'); return }

    setLocalLoading(true);

    try {
      const response = await login(email, password, 'volunteer', {});

      // login function return karda hai — catch nahi chalta
      if (!response?.success) {
        const code = response?.code || ''
        setErrorCode(code)

        if (code === 'ACCOUNT_PENDING_APPROVAL') {
          setError('⏳ Your account is pending admin approval. You will be notified once approved.')
        } else if (code === 'ACCOUNT_REJECTED') {
          setError('❌ Your volunteer application was rejected. Please contact support.')
        } else {
          setError(response?.message || 'Invalid email or password.')
        }
      }
    } catch (err: any) {
      const code = err?.response?.data?.code || ''
      setErrorCode(code)

      if (code === 'ACCOUNT_PENDING_APPROVAL') {
        setError('⏳ Your account is pending admin approval. You will be notified once approved.')
      } else if (code === 'ACCOUNT_REJECTED') {
        setError('❌ Your volunteer application was rejected. Please contact support.')
      } else {
        setError(err?.message || 'Login failed. Please try again.')
      }
    } finally {
      setLocalLoading(false)
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Volunteer Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Email Address"
          type="email"
          value={email}
          onChange={(value: string) => setEmail(value)}
          className="text-black text-1xl"
          placeholder="Enter your email"
          required
          showPasswordToggle={false}
        />

        <div>
          <InputField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
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
              className="text-xs cursor-pointer text-green-600 hover:text-green-500 transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`flex items-start gap-2.5 p-3 rounded-lg border ${
            errorCode === 'ACCOUNT_PENDING_APPROVAL'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : errorCode === 'ACCOUNT_REJECTED'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`} role="alert">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <div>
              <p className="text-sm">{error}</p>
              {errorCode === 'ACCOUNT_PENDING_APPROVAL' && (
                <p className="text-xs mt-1 opacity-80">
                  Please check your email for updates.
                </p>
              )}
              {errorCode === 'ACCOUNT_REJECTED' && (
                <button
                  onClick={() => window.location.href = '/contact-support'}
                  className="mt-1 text-xs underline hover:no-underline"
                >
                  Contact Support
                </button>
              )}
            </div>
          </div>
        )}

        <PrimaryButton
          type="submit"
          disabled={localLoading}
          className="w-full cursor-pointer"
          role="volunteer"
        >
          {localLoading ? 'Signing in...' : 'Sign in as Volunteer'}
        </PrimaryButton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">Don't have an account?</p>
        <button
          onClick={() => router.push('/register/volunteer')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Apply to be a Volunteer
        </button>
      </div>
    </div>
  );
};

export default VolunteerLogin;