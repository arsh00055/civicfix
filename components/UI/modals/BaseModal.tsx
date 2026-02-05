// // 'use client';

// // import React, { useEffect } from 'react';
// // import { XMarkIcon } from '@heroicons/react/24/outline';

// // interface BaseModalProps {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   title?: string;
// //   children: React.ReactNode;
// //   size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
// //   closeOnOverlayClick?: boolean;
// //   showCloseButton?: boolean;
// // }

// // const BaseModal: React.FC<BaseModalProps> = ({
// //   isOpen,
// //   onClose,
// //   title,
// //   children,
// //   size = 'md',
// //   closeOnOverlayClick = true,
// //   showCloseButton = true,
// // }) => {
// //   useEffect(() => {
// //     const handleEscape = (e: KeyboardEvent) => {
// //       if (e.key === 'Escape' && isOpen) {
// //         onClose();
// //       }
// //     };

// //     if (isOpen) {
// //       document.body.style.overflow = 'hidden';
// //       document.addEventListener('keydown', handleEscape);
// //     }

// //     return () => {
// //       document.body.style.overflow = 'unset';
// //       document.removeEventListener('keydown', handleEscape);
// //     };
// //   }, [isOpen, onClose]);

// //   if (!isOpen) return null;

// //   const sizeClasses = {
// //     sm: 'max-w-md',
// //     md: 'max-w-lg',
// //     lg: 'max-w-2xl',
// //     xl: 'max-w-4xl',
// //     full: 'max-w-full mx-4',
// //   };

// //   return (
// //     <div className="fixed inset-0 z-50 overflow-y-auto">
// //       <div className="flex min-h-full items-center justify-center p-4 text-center">
// //         {/* Overlay */}
// //         <div 
// //           className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
// //           onClick={closeOnOverlayClick ? onClose : undefined}
// //           aria-hidden="true"
// //         />

// //         {/* Modal */}
// //         <div className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all`}>
// //           {/* Header */}
// //           {(title || showCloseButton) && (
// //             <div className="bg-white px-6 py-4 border-b border-gray-200">
// //               <div className="flex items-center justify-between">
// //                 {title && (
// //                   <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
// //                 )}
// //                 {showCloseButton && (
// //                   <button
// //                     onClick={onClose}
// //                     className="text-gray-400 hover:text-gray-600 transition-colors"
// //                     aria-label="Close modal"
// //                   >
// //                     <XMarkIcon className="h-6 w-6" />
// //                   </button>
// //                 )}
// //               </div>
// //             </div>
// //           )}

// //           {/* Content */}
// //           <div className="px-6 py-4">
// //             {children}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default BaseModal;

// 'use client';

// import React, { useEffect } from 'react';
// import { XMarkIcon } from '@heroicons/react/24/outline';

// interface BaseModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title?: string;
//   children: React.ReactNode;
//   size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
//   closeOnOverlayClick?: boolean;
//   showCloseButton?: boolean;
// }

// const BaseModal: React.FC<BaseModalProps> = ({
//   isOpen,
//   onClose,
//   title,
//   children,
//   size = 'md',
//   closeOnOverlayClick = true,
//   showCloseButton = true,
// }) => {
//   useEffect(() => {
//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === 'Escape' && isOpen) {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//       document.addEventListener('keydown', handleEscape);
//     }

//     return () => {
//       document.body.style.overflow = 'unset';
//       document.removeEventListener('keydown', handleEscape);
//     };
//   }, [isOpen, onClose]);

//   if (!isOpen) return null;

//   const sizeClasses = {
//     sm: 'max-w-md',
//     md: 'max-w-lg',
//     lg: 'max-w-2xl',
//     xl: 'max-w-4xl',
//     full: 'max-w-full mx-4',
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex min-h-screen items-center justify-center p-4">
//         {/* Overlay */}
//         <div 
//           className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
//           onClick={closeOnOverlayClick ? onClose : undefined}
//           aria-hidden="true"
//         />

//         {/* Modal - Centered with transform translate */}
//         <div className={`relative ${sizeClasses[size]} transform translate-y-0 transition-all`}>
//           <div className="bg-white rounded-lg shadow-xl overflow-hidden">
//             {/* Header */}
//             {(title || showCloseButton) && (
//               <div className="bg-white px-6 py-4 border-b border-gray-200">
//                 <div className="flex items-center justify-between">
//                   {title && (
//                     <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//                   )}
//                   {showCloseButton && (
//                     <button
//                       onClick={onClose}
//                       className="text-gray-400 hover:text-gray-600 transition-colors"
//                       aria-label="Close modal"
//                     >
//                       <XMarkIcon className="h-6 w-6" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Content */}
//             <div className="px-6 py-4">
//               {children}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BaseModal;

'use client';

import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay with blur effect */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Modal with glass effect and shadow */}
        <div className={`relative ${sizeClasses[size]} w-full transform transition-all duration-300`}>
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
            {/* Header with gradient */}
            {(title || showCloseButton) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  {title && (
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 transition-all duration-200 p-1.5 rounded-full"
                      aria-label="Close modal"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseModal;