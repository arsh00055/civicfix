'use client';

import React from 'react';

type LoaderMode = 'page' | 'content' | 'skeleton' | 'inline';

interface LoadingProps {
  // State
  isLoading?: boolean;
  isError?: boolean;
  
  // Content
  children?: React.ReactNode;
  message?: string;
  errorMessage?: string;
  onRetry?: () => void;
  
  // Mode & Variants
  mode?: LoaderMode;
  skeletonType?: 'card' | 'list' | 'avatar' | 'table' | 'stats';
  skeletonCount?: number;
  
  // Layout
  className?: string;
  overlay?: boolean;
}

export default function Loading({
  // State
  isLoading = false,
  isError = false,
  
  // Content
  children,
  message = 'Loading...',
  errorMessage = 'Failed to load content',
  onRetry,
  
  // Mode
  mode = 'content',
  skeletonType = 'card',
  skeletonCount = 1,
  
  // Layout
  className = '',
  overlay = false,
}: LoadingProps) {
  // Error State
  if (isError) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[200px] p-6 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700 mb-4">{errorMessage}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    switch (mode) {
      case 'page':
        return (
          <div className={`fixed inset-0 bg-white z-50 flex items-center justify-center ${className}`}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{message}</p>
            </div>
          </div>
        );

      case 'skeleton':
        const renderSkeleton = () => {
          const baseClass = 'animate-pulse bg-gray-200 rounded';
          
          switch (skeletonType) {
            case 'card':
              return Array.from({ length: skeletonCount }, (_, i) => (
                <div key={i} className="bg-white border rounded-lg p-4 space-y-3">
                  <div className={`h-4 ${baseClass} w-3/4`}></div>
                  <div className={`h-3 ${baseClass} w-1/2`}></div>
                  <div className={`h-8 ${baseClass} mt-2`}></div>
                </div>
              ));
              
            case 'list':
              return Array.from({ length: skeletonCount }, (_, i) => (
                <div key={i} className="space-y-2">
                  <div className={`h-4 ${baseClass} w-full`}></div>
                  <div className={`h-4 ${baseClass} w-5/6`}></div>
                  <div className={`h-4 ${baseClass} w-4/6`}></div>
                </div>
              ));
              
            case 'avatar':
              return Array.from({ length: skeletonCount }, (_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${baseClass} rounded-full`}></div>
                  <div className="flex-1 space-y-2">
                    <div className={`h-4 ${baseClass} w-3/4`}></div>
                    <div className={`h-3 ${baseClass} w-1/2`}></div>
                  </div>
                </div>
              ));
              
            case 'stats':
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: skeletonCount }, (_, i) => (
                    <div key={i} className={`h-24 ${baseClass}`}></div>
                  ))}
                </div>
              );
              
            case 'table':
              return (
                <div className="space-y-3">
                  <div className={`h-10 ${baseClass}`}></div>
                  <div className={`h-8 ${baseClass}`}></div>
                  <div className={`h-8 ${baseClass}`}></div>
                </div>
              );
              
            default:
              return <div className={`h-24 ${baseClass} ${className}`}></div>;
          }
        };
        
        return <div className={className}>{renderSkeleton()}</div>;

      case 'inline':
        return (
          <div className={`inline-flex items-center ${className}`}>
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
            <span className="text-sm text-gray-600">{message}</span>
          </div>
        );

      case 'content':
      default:
        if (overlay) {
          return (
            <div className={`relative ${className}`}>
              {children}
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-100 border-t-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">{message}</p>
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div className={`flex flex-col items-center justify-center min-h-[100px] ${className}`}>
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          </div>
        );
    }
  }

  // Content State
  return <div className={className}>{children}</div>;
}

// Convenience exports
export const PageLoader = (props: Omit<LoadingProps, 'mode' | 'children'>) => (
  <Loading mode="page" {...props} />
);

export const ContentLoader = (props: Omit<LoadingProps, 'mode'>) => (
  <Loading mode="content" {...props} />
);

export const SkeletonLoader = (props: Omit<LoadingProps, 'mode' | 'children'>) => (
  <Loading mode="skeleton" {...props} />
);

export const InlineLoader = (props: Omit<LoadingProps, 'mode' | 'children'>) => (
  <Loading mode="inline" {...props} />
);