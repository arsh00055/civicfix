import React from 'react';
import BaseModal from './BaseModal';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  alt = 'Image',
}) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="flex justify-center">
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-96 object-contain rounded-lg"
        />
      </div>
    </BaseModal>
  );
};

export default ImageModal;