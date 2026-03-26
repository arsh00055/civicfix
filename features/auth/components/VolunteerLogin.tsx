'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/components/UI/forms/InputField';
import Error from '@/app/error'
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import { useAuth } from '../hooks/useAuth';

const VolunteerLogin: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password, 'volunteer', {});
      router.push('/volunteer');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
        setError((err as any).message);
      } else {
        setError('Login failed');
      }
    }
  };

  const useDemoCredentials = () => {
    setEmail('volunteer@demo.com');
    setPassword('demopassword123');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Volunteer Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Email Address"
          type="email"
          value={email}
          onChange={setEmail}
          className="text-black text-1xl"
          placeholder="Enter your email"
          required
        />
        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          className="text-black"
          placeholder="Enter your password"
          required
        />
        
        {error && (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />)}

        <div className="space-y-3">
          <PrimaryButton
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer"
            role="volunteer"
          >
            {isLoading ? 'Signing in...' : 'Sign in as Volunteer'}
          </PrimaryButton>

        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/volunteer/register" className="text-green-600 hover:text-green-500 font-medium">
            Apply to be a Volunteer
          </a>
        </p>
      </div>
    </div>
  );
};

export default VolunteerLogin;