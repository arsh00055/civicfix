import React from 'react';

interface IconButtonProps {
  icon: React.FC<{ className?: string }>;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  title?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  disabled = false,
  className = '',
  title,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100
        disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent
        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}
      `}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
};

export default IconButton;