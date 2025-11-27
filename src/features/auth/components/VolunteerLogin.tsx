import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import InputField from '../../../components/UI/forms/InputField';
import PrimaryButton from '../../../components/UI/buttons/PrimaryButton';

const VolunteerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password, 'volunteer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const useDemoCredentials = () => {
    setEmail('volunteer@demo.com');
    setPassword('demopassword123');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Volunteer Login</h2>
      
      {/* Demo Credentials Banner */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-700">
          <strong>Demo Access:</strong> Use the button below to auto-fill demo credentials
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Email Address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Enter your email"
          required
        />
        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
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
            {isLoading ? 'Signing in...' : 'Sign in as Volunteer'}
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

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Want to become a volunteer?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default VolunteerLogin;