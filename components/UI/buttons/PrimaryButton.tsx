// import React from 'react';

// interface PrimaryButtonProps {
//   children: React.ReactNode;
//   onClick?: () => void;
//   disabled?: boolean;
//   type?: 'button' | 'submit' | 'reset';
//   className?: string;
//   isLoading?: boolean;
//   size?: 'sm' | 'md' | 'lg';
//   fullWidth?: boolean;
// }

// const PrimaryButton: React.FC<PrimaryButtonProps> = ({
//   children,
//   onClick,
//   disabled = false,
//   type = 'button',
//   className = '',
//   isLoading = false,
//   size = 'md',
//   fullWidth = false,
// }) => {
//   const sizeClasses = {
//     sm: 'py-1.5 px-3 text-sm',
//     md: 'py-2 px-4 text-base',
//     lg: 'py-3 px-6 text-lg',
//   };

//   return (
//     <button
//       type={type}
//       onClick={onClick}
//       disabled={disabled || isLoading}
//       className={`
//         inline-flex items-center justify-center
//         bg-blue-600 hover:bg-blue-700 
//         disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400
//         text-white font-medium rounded-lg
//         transition-colors duration-200 ease-in-out
//         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
//         active:scale-95
//         ${sizeClasses[size]}
//         ${fullWidth ? 'w-full' : ''}
//         ${className}
//       `}
//     >
//       {isLoading ? (
//         <>
//           <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
//           Loading...
//         </>
//       ) : (
//         children
//       )}
//     </button>
//   );
// };

// export default PrimaryButton;

import React from 'react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  role?: 'citizen' | 'volunteer' | 'admin';
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  isLoading = false,
  size = 'md',
  fullWidth = false,
  role = 'citizen', // Default to citizen
}) => {
  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };

  // Color classes based on role
  const roleClasses = {
    citizen: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    volunteer: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    admin: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center
        ${roleClasses[role]}
        disabled:bg-green-600 disabled:cursor-not-allowed disabled:hover:bg-gray-400
        text-white font-medium rounded-lg
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        active:scale-95
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default PrimaryButton;