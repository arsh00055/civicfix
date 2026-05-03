import React from 'react';

interface IconButtonProps {
  icon: React.FC<{ className?: string }>;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  disabled = false,
  className = '',
  title,
  type = 'button',
  ariaLabel,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || title}
      className={`
        inline-flex cursor-pointer items-center justify-center p-2 rounded-lg
        text-gray-600 hover:text-gray-900 hover:bg-gray-100
        disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        active:scale-95
        ${className}
      `}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
};

export default IconButton;