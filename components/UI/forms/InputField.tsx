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
  showPasswordToggle: boolean;
  onTogglePassword?: () => void;
  isPasswordVisible?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({
  label,
  type = 'type',
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
  showPasswordToggle = false,
  onTogglePassword,
  isPasswordVisible = false
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
            ${(rightIcon || (type === 'password' && showPasswordToggle)) ? 'pr-10' : ''}
            transition-colors duration-200
          `}
        />
      

{(type === 'password' || showPasswordToggle) && onTogglePassword && (
  <button
    type="button"
    onClick={onTogglePassword}
    className="
      absolute inset-y-0 right-0 pr-3 flex items-center
      text-gray-500 hover:text-gray-700 focus:outline-none
    "
    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
  >
    {isPasswordVisible ? (
      // Eye Open (password visible)
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 
            7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ) : (
      // Eye Closed (password hidden)
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
        />
      </svg>
    )}
  </button>
)}

         
        {rightIcon && !(type === 'password' && showPasswordToggle) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;