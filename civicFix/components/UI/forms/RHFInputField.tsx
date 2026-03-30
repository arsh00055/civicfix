import React, { forwardRef } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface RHFInputFieldProps {
  label?: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  registration: Partial<UseFormRegisterReturn>;
  id?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const RHFInputField = forwardRef<HTMLInputElement, RHFInputFieldProps>(({
  label,
  type = 'text',
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  wrapperClassName = '',
  registration,
  id,
  helperText,
  leftIcon,
  rightIcon,
}, ref) => {
  const { name, onChange, onBlur, ref: registrationRef } = registration;

  return (
    <div className={wrapperClassName}>
      {label && (
        <label 
          htmlFor={id || name}
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
          ref={registrationRef}
          id={id || name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error 
              ? 'border-red-300 focus:border-red-300 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            transition-colors duration-200
            ${className}
          `}
          {...(required && { 'aria-required': 'true' })}
          {...(error && { 'aria-invalid': 'true', 'aria-describedby': `${id || name}-error` })}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p 
          id={`${id || name}-error`}
          className="mt-1 text-sm text-red-600"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

RHFInputField.displayName = 'RHFInputField';

export default RHFInputField;