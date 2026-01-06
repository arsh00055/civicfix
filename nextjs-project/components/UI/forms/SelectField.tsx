import React, { forwardRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface SelectFieldProps {
  label?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  helperText?: string;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  id,
  name,
  helperText,
}, ref) => {
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
        <select
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            appearance-none bg-white
            ${error 
              ? 'border-red-300 focus:border-red-300 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}
            transition-colors duration-200
          `}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(option => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </div>
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

SelectField.displayName = 'SelectField';

export default SelectField;