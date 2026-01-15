import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import InputField from '../../../components/UI/forms/InputField';
import Error from '@/app/error'
import PrimaryButton from '../../../components/UI/buttons/PrimaryButton';

const CitizenLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password, 'citizen', {});
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
        setError((err as any).message);
      } else {
        setError('Login failed');
      }
    }
  };

  const useDemoCredentials = () => {
    setEmail('citizen@demo.com');
    setPassword('demopassword123');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Citizen Login</h2>

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
          >
            {isLoading ? 'Signing in...' : 'Sign in as Citizen'}
          </PrimaryButton>

          <button
            type="button"
            onClick={useDemoCredentials}
            className="w-full py-2 px-4 border cursor-pointer border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Use Demo Credentials
          </button>
        </div>
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
  );
};

export default CitizenLogin;