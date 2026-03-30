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
            className="flex-1 py-3 cursor-pointer text-base font-medium border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            {cancelText}
          </SecondaryButton>
          <PrimaryButton 
            onClick={onConfirm}
            className={`flex-1 py-3 cursor-pointer text-base font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 ${styles.confirmButton}`}
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