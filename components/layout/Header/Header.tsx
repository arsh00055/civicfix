// 'use client';

// import React, { useCallback } from 'react';
// import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
// import { toggleSidebar } from '@/lib/store/slices/uiSlice';
// import UserMenu from './UserMenu';
// import NotificationBell from './NotificationBell';
// import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
// import { useEffect, useState } from 'react';

// interface HeaderProps {
//   userRole: string | null;
// }

// const Header: React.FC<HeaderProps> = ({ userRole }) => {
//   const dispatch = useAppDispatch();
//   const [background, setBackground] = useState<string>('');
//   const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
//   const [isMobile, setIsMobile] = useState(false);

//   // Detect if we're on mobile
//   useEffect(() => {
//     const checkIfMobile = () => {
//       setIsMobile(window.innerWidth < 1024);
//     };
    
//     // Initial check
//     checkIfMobile();
    
//     // Add event listener for resize
//     window.addEventListener('resize', checkIfMobile);
    
//     return () => {
//       window.removeEventListener('resize', checkIfMobile);
//     };
//   }, []);

//   const getBackground = useCallback(() => {
//     switch (userRole) {
//       case 'citizen':
//         return 'bg-gradient-to-r from-blue-600 to-indigo-700';
//       case 'volunteer':
//         return 'bg-gradient-to-r from-green-600 to-emerald-700';
//       case 'admin':
//         return 'bg-gradient-to-r from-purple-600 to-indigo-700';
//       default:
//         return 'bg-gradient-to-r from-gray-600 to-gray-700';
//     }
//   }, [userRole]);

//   useEffect(() => {
//     setBackground(getBackground());
//   }, [getBackground]);

//   const handleMenuClick = () => {
//     dispatch(toggleSidebar());
//   };

//   // Show different icons based on mobile/desktop and sidebar state
//   const getMenuIcon = () => {
//     if (isMobile) {
//       // On mobile: show X when sidebar is open, hamburger when closed
//       return sidebarOpen ? (
//         <XMarkIcon className="h-6 w-6" />
//       ) : (
//         <Bars3Icon className="h-6 w-6" />
//       );
//     } else {
//       // On desktop: show X when sidebar is open, hamburger when closed
//       return sidebarOpen ? (
//         <XMarkIcon className="h-6 w-6" />
//       ) : (
//         <Bars3Icon className="h-6 w-6" />
//       );
//     }
//   };

//   // Get aria-label based on state
//   const getAriaLabel = () => {
//     return sidebarOpen ? 'Close sidebar' : 'Open sidebar';
//   };

//   return (
//     <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
//       <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
//         <div className="flex items-center space-x-3 md:space-x-4">
//           <button
//             onClick={handleMenuClick}
//             className={`p-2 rounded-md text-white cursor-pointer ${background} transition-colors hover:opacity-90 active:scale-95`}
//             aria-label={getAriaLabel()}
//           >
//             {getMenuIcon()}
//           </button>
//           <h1 className="text-lg md:text-xl font-semibold text-gray-800">
//             Hi 👋
//           </h1>
//         </div>

//         <div className="flex items-center space-x-3 md:space-x-4">
//           <NotificationBell />
//           <UserMenu role={userRole} />
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { toggleSidebar } from '@/lib/store/slices/uiSlice';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { usePathname, useParams } from 'next/navigation';

interface headerProps{
  role: 'citizen' | 'volunteer' | 'admin' | null;
}

const Header: React.FC<headerProps> = ({ role }) => {
  const dispatch = useAppDispatch();
  const [background, setBackground] = useState<string>('bg-gradient-to-r from-gray-600 to-gray-700');
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const [isMobile, setIsMobile] = useState(false);
  
  const pathname = usePathname();
  const params = useParams();
    
  const userRole = role;

  // Detect if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Set background based on role
  useEffect(() => {
    
    let newBackground = 'bg-gradient-to-r from-gray-600 to-gray-700';
    
    switch (userRole) {
      case 'citizen':
        newBackground = 'bg-gradient-to-r from-blue-600 to-indigo-700';
        break;
      case 'volunteer':
        newBackground = 'bg-gradient-to-r from-green-600 to-emerald-700';
        break;
      case 'admin':
        newBackground = 'bg-gradient-to-r from-purple-600 to-indigo-700';
        break;
      default:
        newBackground = 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
    
    setBackground(newBackground);
    
    // Also log the button element to see what's actually applied
    setTimeout(() => {
      const button = document.querySelector('header button');
      console.log('🔍 Actual button classes:', button?.className);
    }, 100);
  }, [userRole]);

  const handleMenuClick = () => {
    dispatch(toggleSidebar());
  };

  const getMenuIcon = () => {
    return sidebarOpen ? (
      <XMarkIcon className="h-6 w-6" />
    ) : (
      <Bars3Icon className="h-6 w-6" />
    );
  };

  const getAriaLabel = () => {
    return sidebarOpen ? 'Close sidebar' : 'Open sidebar';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center space-x-3 md:space-x-4">
          <button
            onClick={handleMenuClick}
            className={`p-2 rounded-md text-white cursor-pointer ${background} transition-colors hover:opacity-90 active:scale-95`}
            aria-label={getAriaLabel()}
          >
            {getMenuIcon()}
          </button>
          <h1 className="text-lg md:text-xl font-semibold text-gray-800">
            Hi 👋
          </h1>
        </div>

        <div className="flex items-center space-x-3 md:space-x-4">
          <NotificationBell />
          <UserMenu role={userRole} />
        </div>
      </div>
    </header>
  );
};

export default Header;