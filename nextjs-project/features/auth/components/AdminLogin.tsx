'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/components/UI/forms/InputField';
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import { useAuth } from '../hooks/useAuth';

const AdminLogin: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password, 'admin', { adminKey });
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const useDemoCredentials = () => {
    setEmail('admin@demo.com');
    setPassword('demopassword123');
    setAdminKey('demo-admin-key');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">Admin Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Email Address"
          type="email"
          value={email}
          onChange={setEmail}
          className="text-black text-1xl"
          placeholder="Enter your admin email"
          required
        />
        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          className="text-black"
          placeholder="Enter your password"
          required
        />
        <InputField
          label="Admin Security Key"
          type="password"
          value={adminKey}
          onChange={setAdminKey}
          className="text-black"
          placeholder="Enter admin security key"
          required
        />
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <PrimaryButton
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Signing in...' : 'Sign in as Admin'}
          </PrimaryButton>

          <button
            type="button"
            onClick={useDemoCredentials}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Use Demo Credentials
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          <strong className="font-semibold">Security Note:</strong> Admin access requires special authorization. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;