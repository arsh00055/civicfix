import React from 'react';

interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed
        text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300
        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
        focus:ring-offset-2 ${className}
      `}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;