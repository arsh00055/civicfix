// 'use client';

// import React from 'react';
// import BaseModal from './BaseModal';
// import PrimaryButton from '../buttons/PrimaryButton';
// import SecondaryButton from '../buttons/SecondaryButton';

// interface ConfirmModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
//   title: string;
//   message?: string; // Make message optional
//   confirmText?: string;
//   cancelText?: string;
//   variant?: 'danger' | 'warning' | 'info' | 'success';
//   isLoading?: boolean;
//   children?: React.ReactNode; // Add children prop
// }

// const ConfirmModal: React.FC<ConfirmModalProps> = ({
//   isOpen,
//   onClose,
//   onConfirm,
//   title,
//   message,
//   confirmText = 'Confirm',
//   cancelText = 'Cancel',
//   variant = 'info',
//   isLoading = false,
//   children, // Destructure children
// }) => {
//   const getButtonColor = () => {
//     switch (variant) {
//       case 'danger': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
//       case 'warning': return 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500';
//       case 'success': return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
//       default: return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
//     }
//   };

//   const getIcon = () => {
//     switch (variant) {
//       case 'danger':
//         return (
//           <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
//             <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.342 16.5c-.77.833.192 2.5 1.732 2.5z" />
//             </svg>
//           </div>
//         );
//       case 'warning':
//         return (
//           <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
//             <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//         );
//       case 'success':
//         return (
//           <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
//             <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//             </svg>
//           </div>
//         );
//       default:
//         return (
//           <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
//             <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//         );
//     }
//   };

//   return (
//     <BaseModal isOpen={isOpen} onClose={onClose} title="" size="sm">
//       <div className="text-center space-y-4">
//         {getIcon()}
//         <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        
//         {/* Conditionally render message or children */}
//         {message && <p className="text-gray-600">{message}</p>}
//         {children}
        
//         <div className="flex space-x-3 justify-center pt-4">
//           <SecondaryButton onClick={onClose} disabled={isLoading}>
//             {cancelText}
//           </SecondaryButton>
//           <PrimaryButton 
//             onClick={onConfirm}
//             className={getButtonColor()}
//             isLoading={isLoading}
//           >
//             {confirmText}
//           </PrimaryButton>
//         </div>
//       </div>
//     </BaseModal>
//   );
// };

// export default ConfirmModal;

'use client';

import React from 'react';
import BaseModal from './BaseModal';
import PrimaryButton from '../buttons/PrimaryButton';
import SecondaryButton from '../buttons/SecondaryButton';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
  children?: React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false,
  children,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          icon: <ExclamationTriangleIcon className="h-8 w-8" />,
          confirmButton: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500/50',
          accentColor: 'text-red-600',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          icon: <ExclamationTriangleIcon className="h-8 w-8" />,
          confirmButton: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:ring-amber-500/50',
          accentColor: 'text-amber-600',
        };
      case 'success':
        return {
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          icon: <CheckCircleIcon className="h-8 w-8" />,
          confirmButton: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:ring-emerald-500/50',
          accentColor: 'text-emerald-600',
        };
      default: // info
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          icon: <InformationCircleIcon className="h-8 w-8" />,
          confirmButton: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500/50',
          accentColor: 'text-blue-600',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="" 
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center space-y-6">
        {/* Icon with decorative circle */}
        <div className="flex justify-center">
          <div className={`relative inline-flex items-center justify-center p-4 ${styles.iconBg} rounded-full`}>
            <div className={`${styles.iconColor}`}>
              {variant === 'info' ? (
                <ShieldCheckIcon className="h-10 w-10" />
              ) : styles.icon}
            </div>
            <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-ping opacity-75"></div>
          </div>
        </div>

        {/* Title with accent color */}
        <div className="space-y-3">
          <h3 className={`text-2xl font-bold ${styles.accentColor}`}>
            {title}
          </h3>
          
          {/* Message with better styling */}
          {message && (
            <div className="px-2">
              <p className="text-gray-600 leading-relaxed text-base">
                {message}
              </p>
            </div>
          )}
          {children}
        </div>

        {/* Action buttons with better spacing and styling */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <SecondaryButton 
            onClick={onClose} 
            disabled={isLoading}
            className="flex-1 py-3 text-base font-medium border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            {cancelText}
          </SecondaryButton>
          <PrimaryButton 
            onClick={onConfirm}
            className={`flex-1 py-3 text-base font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 ${styles.confirmButton}`}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {confirmText}
          </PrimaryButton>
        </div>

        {/* Optional decorative element */}
        <div className="pt-4">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <p className="text-xs text-gray-400 mt-3">
            You can cancel anytime before confirming
          </p>
        </div>
      </div>
    </BaseModal>
  );
};

export default ConfirmModal;