// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import InputField from '@/components/UI/forms/InputField';
// import Error from '@/app/error'
// import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
// import { useAuth } from '../hooks/useAuth';

// const VolunteerLogin: React.FC = () => {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const { login, isLoading } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     try {
//       await login(email, password, 'volunteer', {});
//       router.push('/volunteer');
//     } catch (err: unknown) {
//       if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
//         setError((err as any).message);
//       } else {
//         setError('Login failed');
//       }
//     }
//   };

//   // const useDemoCredentials = () => {
//   //   setEmail('volunteer@demo.com');
//   //   setPassword('demopassword123');
//   // };

//   return (
//     <div>
//       <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Volunteer Login</h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <InputField
//           label="Email Address"
//           type="email"
//           value={email}
//           onChange={(value: string) => setEmail(value)}
//           className="text-black text-1xl"
//           placeholder="Enter your email"
//           required
//           showPasswordToggle={false}
//         />
//         <InputField
//           label="Password"
//           type={showPassword ? "text" : "password"} 
//           value={password}
//           onChange={setPassword}
//           autoComplete="current-password"
//           className="text-black"
//           placeholder="Enter your password"
//           required
//           showPasswordToggle={true}
//           onTogglePassword={() => setShowPassword(!showPassword)}
//           isPasswordVisible={showPassword}
//         />
        
//         {error && (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />)}

//         <div className="space-y-3">
//           <PrimaryButton
//             type="submit"
//             disabled={isLoading}
//             className="w-full cursor-pointer"
//             role="volunteer"
//           >
//             {isLoading ? 'Signing in...' : 'Sign in as Volunteer'}
//           </PrimaryButton>

//         </div>
//       </form>

//       <div className="mt-6 text-center">
//         <p className="text-sm text-gray-600">
//           Don't have an account?{' '}
//           <a href="/volunteer/register" className="text-green-600 hover:text-green-500 font-medium">
//             Apply to be a Volunteer
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default VolunteerLogin;



'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/components/UI/forms/InputField';
import Error from '@/app/error'
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import { useAuth } from '../hooks/useAuth';
import VolunteerRegistration from '@/app/(auth)/register/components/VolunteerRegistration';

const VolunteerLogin: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState<string>(''); // 👈 NEW: Track error code
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorCode(''); // 👈 Reset error code

    try {
      await login(email, password, 'volunteer', {});
      router.push('/volunteer');
    } catch (err: unknown) {
      // 👇 IMPROVED ERROR HANDLING
      if (err && typeof err === 'object') {
        const errorObj = err as any;
        
        // Check if error has response data with code
        if (errorObj.response?.data?.code) {
          setErrorCode(errorObj.response.data.code);
          
          // Set specific messages based on error code
          if (errorObj.response.data.code === 'ACCOUNT_PENDING_APPROVAL') {
            setError('⏳ Your account is pending admin approval. You will receive an email once approved.');
          } 
          else if (errorObj.response.data.code === 'ACCOUNT_REJECTED') {
            setError('❌ Your volunteer application was rejected. Please contact support for more information.');
          }
          else {
            setError(errorObj.response?.data?.message || errorObj.message || 'Login failed');
          }
        }
        else if (errorObj.message) {
          setError(errorObj.message);
        } 
        else {
          setError('Login failed. Please try again.');
        }
      } else {
        setError('Login failed');
      }
    }
  };

  const handleSuccess = () => {
    router.push('/login?message=registration_success')
  }

  const handleSwitchToLogin = () => {
    router.push('/login')
  }


  if(showRegistration){
    return (
      <div className="w-full max-h-screen overflow-y-auto">
      <VolunteerRegistration
        onSuccess={handleSuccess}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
    )
  }
  

  return (
    <div>
      <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Volunteer Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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
        
        {error && (
          <div className={`p-3 rounded-md ${
            errorCode === 'ACCOUNT_PENDING_APPROVAL' 
              ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              : errorCode === 'ACCOUNT_REJECTED'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`} role="alert">
            <p className="text-sm">{error}</p>
            {errorCode === 'ACCOUNT_PENDING_APPROVAL' && (
              <p className="text-xs mt-1 text-yellow-600">
                Please check your email for updates. You will be notified once approved.
              </p>
            )}
            {errorCode === 'ACCOUNT_REJECTED' && (
              <button
                onClick={() => window.location.href = '/contact-support'}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Contact Support
              </button>
            )}
          </div>
        )}

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
  <p className="text-sm text-gray-600 mb-2">
    Don't have an account?
  </p>
  <button
    onClick={() => router.push('/register/volunteer')}  // 👈 CHANGE THIS
    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
  >
    Apply to be a Volunteer
  </button>
</div>

    </div>
  );
};

export default VolunteerLogin;