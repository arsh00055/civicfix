import React from 'react';

interface ContentLoaderProps {
  children: React.ReactNode;
  isLoading: boolean;
  skeleton: React.ReactNode;
  className?: string;
}

const ContentLoader: React.FC<ContentLoaderProps> = ({
  children,
  isLoading,
  skeleton,
  className = '',
}) => {
  return (
    <div className={className}>
      {isLoading ? skeleton : children}
    </div>
  );
};

export default ContentLoader;