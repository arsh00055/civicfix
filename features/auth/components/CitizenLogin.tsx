// import React, { useState } from 'react';
// import { useAuth } from '../hooks/useAuth';
// import InputField from '../../../components/UI/forms/InputField';
// // import Error from '@/app/error'
// import PrimaryButton from '../../../components/UI/buttons/PrimaryButton';

// const CitizenLogin: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState<string>('');
//   const { login, isLoading } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
  
//     try {
//       const response = await login(email, password, 'citizen', {});
//       console.log("citizen login", response);
//       if(!response.success){
//         setError(response.message);
//       }
      
//     } catch (err: any) {
//       console.log('Error object:', err); // 👈 Console ch check
      
//       // Error message set karo
//       if (typeof err === 'string') {
//         setError(err);
//       } else if (err?.message) {
//         setError(err.message);
//       } else {
//         setError('Login failed. Please try again.');
//       }
//     }
//   };

//   const useDemoCredentials = () => {
//     setEmail('citizen@demo.com');
//     setPassword('demopassword123');
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Citizen Login</h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//       <InputField
//           label="Email Address"
//           type="email"
//           value={email}
//           onChange={(value: string) => setEmail(value)}
//           className="text-black text-1xl"
//           placeholder="Enter your email"
//           required showPasswordToggle={false}      />
//       <InputField
//         label="Password"
//         type="password"
//         value={password}
//         onChange={(value: string) => setPassword(value)}
//         autoComplete="current-password"
//         className="text-black"
//         placeholder="Enter your password"
//         required
//         showPasswordToggle={true}
//         onTogglePassword={() => setShowPassword(!showPassword)}
//         isPasswordVisible={showPassword}
//       />
        
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
//             {error}
//           </div>
//         )}


//         <div className="space-y-3">
//           <PrimaryButton
//             type="submit"
//             disabled={isLoading}
//             className="w-full cursor-pointer"
//             role="citizen"
//           >
//             {isLoading ? 'Signing in...' : 'Sign in as Citizen'}
//           </PrimaryButton>

//         </div>
//       </form>

//       <div className="mt-6 text-center">
//         <p className="text-sm text-gray-600">
//           Don't have an account?{' '}
//           <a href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
//             Sign up
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default CitizenLogin;


import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import InputField from '../../../components/UI/forms/InputField';
import PrimaryButton from '../../../components/UI/buttons/PrimaryButton';

const CitizenLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await login(email, password, 'citizen', {});
      console.log("citizen login", response);
      if(!response.success){
        setError(response.message);
      }
      
    } catch (err: any) {
      console.log('Error object:', err);
      
      if (typeof err === 'string') {
        setError(err);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Citizen Login</h2>

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
          type={showPassword ? "text" : "password"}  // 👈 YEH CHANGE KARO
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
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <PrimaryButton
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer"
            role="citizen"
          >
            {isLoading ? 'Signing in...' : 'Sign in as Citizen'}
          </PrimaryButton>
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