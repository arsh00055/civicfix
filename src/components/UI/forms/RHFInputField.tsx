import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface RHFInputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  registration: UseFormRegisterReturn;
}

const RHFInputField: React.FC<RHFInputFieldProps> = ({
  label,
  type = 'text',
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  registration,
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error 
            ? 'border-red-300 focus:border-red-300' 
            : 'border-gray-300 focus:border-blue-500'
          }
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
        {...registration}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default RHFInputField;