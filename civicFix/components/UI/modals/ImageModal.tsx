'use client';

import React from 'react';
import Image from 'next/image';
import BaseModal from './BaseModal';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
  title?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  alt = 'Image',
  title,
}) => {
  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      size="lg"
      showCloseButton={false}
    >
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex justify-center">
          <div className="relative w-full h-[70vh]">
            <Image
              src={imageUrl}
              alt={alt}
              fill
              className="object-contain rounded-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              priority
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ImageModal;