// import React, { forwardRef } from 'react';

// interface InputFieldProps {
//   label?: string;
//   type?: string;
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;
//   inputClassName?: string;
//   error?: string;
//   required?: boolean;
//   disabled?: boolean;
//   className?: string;
//   id?: string;
//   name?: string;
//   helperText?: string;
//   leftIcon?: React.ReactNode;
//   rightIcon?: React.ReactNode;
//   autoComplete?: string;
//   autoFocus?: boolean;
// }

// const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({
//   label,
//   type = 'text',
//   value,
//   onChange,
//   placeholder,
//   error,
//   required = false,
//   disabled = false,
//   className = '',
//   id,
//   name,
//   helperText,
//   leftIcon,
//   rightIcon,
//   autoComplete,
//   autoFocus = false,
// }, ref) => {
//   // Determine appropriate autocomplete value based on input type and name
//   const getAutoCompleteValue = () => {
//     // If autoComplete prop is provided, use it
//     if (autoComplete) return autoComplete;
    
//     // Otherwise, infer from type and name
//     if (type === 'email') return 'email';
//     if (type === 'password') {
//       if (name?.includes('current') || name === 'password') return 'current-password';
//       if (name?.includes('new')) return 'new-password';
//       return 'current-password';
//     }
//     if (name === 'username') return 'username';
//     if (name?.includes('name')) return 'name';
//     if (name?.includes('phone') || name?.includes('tel')) return 'tel';
//     if (name?.includes('address')) return 'street-address';
//     if (name?.includes('city')) return 'address-level2';
//     if (name?.includes('state') || name?.includes('province')) return 'address-level1';
//     if (name?.includes('zip') || name?.includes('postal')) return 'postal-code';
//     if (name?.includes('country')) return 'country-name';
    
//     return undefined;
//   };

//   return (
//     <div className={className}>
//       {label && (
//         <label 
//           htmlFor={id}
//           className="block text-sm font-medium text-gray-700 mb-2"
//         >
//           {label} {required && <span className="text-red-500">*</span>}
//         </label>
//       )}
//       <div className="relative">
//         {leftIcon && (
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             {leftIcon}
//           </div>
//         )}
//         <input
//           ref={ref}
//           id={id}
//           name={name}
//           type={type}
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           placeholder={placeholder}
//           disabled={disabled}
//           autoComplete={getAutoCompleteValue()}
//           autoFocus={autoFocus}
//           className={`
//             w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//             ${error 
//               ? 'border-red-300 focus:border-red-300 focus:ring-red-200' 
//               : 'border-gray-300 focus:border-blue-500'
//             }
//             ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}
//             ${leftIcon ? 'pl-10' : ''}
//             ${rightIcon ? 'pr-10' : ''}
//             transition-colors duration-200
//           `}
//         />
//         {rightIcon && (
//           <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
//             {rightIcon}
//           </div>
//         )}
//       </div>
//       {error && (
//         <p className="mt-1 text-sm text-red-600">{error}</p>
//       )}
//       {helperText && !error && (
//         <p className="mt-1 text-sm text-gray-500">{helperText}</p>
//       )}
//     </div>
//   );
// });

// InputField.displayName = 'InputField';

// export default InputField;

import React, { forwardRef } from 'react';

interface InputFieldProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputClassName?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  autoComplete?: string;
  autoFocus?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  id,
  name,
  helperText,
  leftIcon,
  rightIcon,
  autoComplete,
  autoFocus = false,
}, ref) => {
  // Determine appropriate autocomplete value based on input type and name
  const getAutoCompleteValue = () => {
    // If autoComplete prop is provided, use it
    if (autoComplete) return autoComplete;
    
    // Otherwise, infer from type and name
    if (type === 'email') return 'email';
    if (type === 'password') {
      if (name?.includes('current') || name === 'password') return 'current-password';
      if (name?.includes('new')) return 'new-password';
      return 'current-password';
    }
    if (name === 'username') return 'username';
    if (name?.includes('name')) return 'name';
    if (name?.includes('phone') || name?.includes('tel')) return 'tel';
    if (name?.includes('address')) return 'street-address';
    if (name?.includes('city')) return 'address-level2';
    if (name?.includes('state') || name?.includes('province')) return 'address-level1';
    if (name?.includes('zip') || name?.includes('postal')) return 'postal-code';
    if (name?.includes('country')) return 'country-name';
    
    return undefined;
  };

  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={getAutoCompleteValue()}
          autoFocus={autoFocus}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error 
              ? 'border-red-300 focus:border-red-300 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white text-gray-900'}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            transition-colors duration-200
          `}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;