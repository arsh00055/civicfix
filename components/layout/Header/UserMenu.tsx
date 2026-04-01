// // 'use client';

// // import React, { useState, useRef, useEffect, useCallback } from 'react';
// // import { useRouter } from 'next/navigation';
// // import { useAuth } from '@/features/auth/hooks/useAuth';
// // import { useAppSelector } from '@/lib/store/hooks';

// // interface UserMenuProps {
// //   role: string | null;
// // }

// // const UserMenu: React.FC<UserMenuProps> = ({ role }) => {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [mounted, setMounted] = useState(false);
// //   const { user, logout } = useAuth();
// //   const router = useRouter();
// //   const menuRef = useRef<HTMLDivElement>(null);
// //   const [background, setBackground] = useState<string>('');
// //   const currentUser = useAppSelector((state) => state.auth.user);

// //   const getBackground = useCallback(() => {
// //     switch (role) {
// //       case 'citizen':
// //         return 'bg-gradient-to-r from-blue-600 to-indigo-700';
// //       case 'volunteer':
// //         return 'bg-gradient-to-r from-green-600 to-emerald-700';
// //       case 'admin':
// //         return 'bg-gradient-to-r from-purple-600 to-indigo-700';
// //       default:
// //         return 'bg-gradient-to-r from-gray-600 to-gray-700';
// //     }
// //   }, [role]);

// //   useEffect(() => {
// //     setBackground(getBackground());
// //   }, [getBackground]);

// //   // Mark component as mounted to prevent hydration mismatch
// //   useEffect(() => {
// //     setMounted(true);
// //   }, []);

// //   useEffect(() => {
// //     const handleClickOutside = (event: MouseEvent) => {
// //       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
// //         setIsOpen(false);
// //       }
// //     };

// //     document.addEventListener('mousedown', handleClickOutside);
// //     return () => document.removeEventListener('mousedown', handleClickOutside);
// //   }, []);

// //   const handleProfileClick = () => {
// //     setIsOpen(false);
// //     router.push('/profile');
// //   };

// //   const handleLogout = async () => {
// //     setIsOpen(false);
// //     await logout();
// //     router.push('/login');
// //   };

// //   const getInitials = (name?: string) => {
// //     if (!name) return 'U';
// //     return name.split(' ').map(n => n[0]).join('').toUpperCase();
// //   };

// //   // Get the user email to display
// //   const userEmail = currentUser?.email || user?.email;

// //   return (
// //     <div className="relative" ref={menuRef}>
      
// //       {/* Trigger */}
// //       <button
// //         onClick={() => setIsOpen(!isOpen)}
// //         className={`flex items-center gap-3 px-3 py-2 rounded-xl ${background}
// //           hover:opacity-90 cursor-pointer transition-all duration-200 shadow-md`}
// //       >
// //         {/* Avatar */}
// //         <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold backdrop-blur">
// //           {getInitials(user?.name)}
// //         </div>

// //         <span className="hidden md:block text-white font-medium">
// //           {user?.name}
// //         </span>
// //       </button>

// //       {/* Dropdown */}
// //       <div
// //         className={`absolute right-0 mt-3 w-56 origin-top-right transform transition-all duration-200
// //         ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
// //       >
// //         <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          
// //           {/* User Info - Fix hydration mismatch */}
// //           <div className="px-4 py-3 border-b text-sm">
// //             <div className="font-semibold text-gray-800 truncate">
// //               {mounted ? userEmail : ''}
// //             </div>
// //             <div className="text-xs text-gray-500 mt-1">
// //               Signed in as <span className="capitalize">{role || 'user'}</span>
// //             </div>
// //           </div>

// //           {/* Menu Items */}
// //           <button
// //             onClick={handleProfileClick}
// //             className="w-full text-left cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
// //           >
// //             👤 Your Profile
// //           </button>

// //           <button
// //             onClick={handleLogout}
// //             className="w-full text-left cursor-pointer px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t"
// //           >
// //             🚪 Sign out
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default UserMenu;


// 'use client';

// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { useAuth } from '@/features/auth/hooks/useAuth';
// import { useAppSelector } from '@/lib/store/hooks';

// interface UserMenuProps {
//   role: string | null;
// }

// const UserMenu: React.FC<UserMenuProps> = ({ role }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const [imageError, setImageError] = useState(false);
//   const { user, logout } = useAuth();
//   const router = useRouter();
//   const menuRef = useRef<HTMLDivElement>(null);
//   const [background, setBackground] = useState<string>('');
//   const currentUser = useAppSelector((state) => state.auth.user);

//   const getBackground = useCallback(() => {
//     switch (role) {
//       case 'citizen':
//         return 'bg-gradient-to-r from-blue-600 to-indigo-700';
//       case 'volunteer':
//         return 'bg-gradient-to-r from-green-600 to-emerald-700';
//       case 'admin':
//         return 'bg-gradient-to-r from-purple-600 to-indigo-700';
//       default:
//         return 'bg-gradient-to-r from-gray-600 to-gray-700';
//     }
//   }, [role]);

//   useEffect(() => {
//     setBackground(getBackground());
//   }, [getBackground]);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleProfileClick = () => {
//     setIsOpen(false);
//     router.push('/profile');
//   };

//   const handleLogout = async () => {
//     setIsOpen(false);
//     await logout();
//     router.push('/login');
//   };

//   const getInitials = (name?: string) => {
//     if (!name) return 'U';
//     return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
//   };

//   // Get user data from multiple sources
//   const userData = currentUser || user;
//   const userEmail = userData?.email;
//   const userName = userData?.name;
//   const userAvatar = userData?.avatar;

// // In UserMenu.tsx, update getAvatarUrl function
// const getAvatarUrl = () => {
//   if (userAvatar && !imageError) {
//     // Add timestamp to prevent caching
//     if (userAvatar.includes('?')) {
//       return `${userAvatar}&t=${Date.now()}`;
//     }
//     return `${userAvatar}?t=${Date.now()}`;
//   }
//   return null;
// };
//   const avatarUrl = getAvatarUrl();

//   // Reset image error when avatar changes
//   useEffect(() => {
//     setImageError(false);
//   }, [userAvatar]);

//   return (
//     <div className="relative" ref={menuRef}>
      
//       {/* Trigger */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className={`flex items-center gap-3 px-3 py-2 rounded-xl ${background}
//           hover:opacity-90 cursor-pointer transition-all duration-200 shadow-md`}
//       >
//         {/* Avatar - Profile Photo */}
//         <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold backdrop-blur overflow-hidden flex-shrink-0">
//           {avatarUrl ? (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img
//               src={avatarUrl}
//               alt={userName || 'User'}
//               className="w-full h-full object-cover"
//               onError={() => setImageError(true)}
//             />
//           ) : (
//             <span>{getInitials(userName)}</span>
//           )}
//         </div>

//         <span className="hidden md:block text-white font-medium truncate max-w-[120px]">
//           {userName}
//         </span>
//       </button>

//       {/* Dropdown */}
//       <div
//         className={`absolute right-0 mt-3 w-64 origin-top-right transform transition-all duration-200 z-50
//         ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
//       >
//         <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          
//           {/* User Info - With Avatar */}
//           <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
//             {/* Small Avatar in dropdown */}
//             <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0">
//               {avatarUrl ? (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img
//                   src={avatarUrl}
//                   alt={userName || 'User'}
//                   className="w-full h-full object-cover"
//                   onError={() => setImageError(true)}
//                 />
//               ) : (
//                 <span className="text-sm">{getInitials(userName)}</span>
//               )}
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="font-semibold text-gray-800 truncate">
//                 {userName}
//               </div>
//               <div className="text-xs text-gray-500 truncate">
//                 {mounted ? userEmail : ''}
//               </div>
//             </div>
//           </div>

//           {/* Role Badge */}
//           <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
//             Signed in as{' '}
//             <span className="capitalize font-medium text-gray-700">
//               {role === 'citizen' ? 'Citizen' : role === 'volunteer' ? 'Volunteer' : role === 'admin' ? 'Administrator' : 'User'}
//             </span>
//           </div>

//           {/* Menu Items */}
//           <button
//             onClick={handleProfileClick}
//             className="w-full text-left cursor-pointer px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
//           >
//             <span className="text-lg">👤</span>
//             Your Profile
//           </button>

//           <button
//             onClick={handleLogout}
//             className="w-full text-left cursor-pointer px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-gray-100"
//           >
//             <span className="text-lg">🚪</span>
//             Sign out
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserMenu;


'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAppSelector } from '@/lib/store/hooks';

interface UserMenuProps {
  role: string | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [background, setBackground] = useState<string>('');
  const currentUser = useAppSelector((state) => state.auth.user);

  const getBackground = useCallback(() => {
    switch (role) {
      case 'citizen':
        return 'bg-gradient-to-r from-blue-600 to-indigo-700';
      case 'volunteer':
        return 'bg-gradient-to-r from-green-600 to-emerald-700';
      case 'admin':
        return 'bg-gradient-to-r from-purple-600 to-indigo-700';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  }, [role]);

  useEffect(() => {
    setBackground(getBackground());
  }, [getBackground]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsOpen(false);
    router.push('/profile');
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get user data from multiple sources
  const userData = currentUser || user;
  const userEmail = userData?.email;
  const userName = userData?.name;
  let userAvatar = userData?.avatar;

  // Fix avatar URL if needed
  if (userAvatar && !userAvatar.startsWith('http') && !userAvatar.startsWith('/')) {
    userAvatar = `/${userAvatar}`;
  }

  // Add timestamp to prevent caching
  const getAvatarUrl = () => {
    if (userAvatar && !imageError) {
      const timestamp = Date.now();
      if (userAvatar.includes('?')) {
        return `${userAvatar}&t=${timestamp}`;
      }
      return `${userAvatar}?t=${timestamp}`;
    }
    return null;
  };

  const avatarUrl = React.useMemo(() => {
    if (userAvatar && !imageError) {
      return userAvatar.includes('?') 
        ? `${userAvatar}&t=${Date.now()}` 
        : `${userAvatar}?t=${Date.now()}`
    }
    return null
  }, [userAvatar, imageError])

  return (
    <div className="relative" ref={menuRef}>
      
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl ${background}
          hover:opacity-90 cursor-pointer transition-all duration-200 shadow-md`}
      >
        {/* Avatar - Profile Photo */}
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold backdrop-blur overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName || 'User'}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span>{getInitials(userName)}</span>
          )}
        </div>

        <span className="hidden md:block text-white font-medium truncate max-w-[120px]">
          {userName}
        </span>
      </button>

      {/* Dropdown */}
      <div
        className={`absolute right-0 mt-3 w-64 origin-top-right transform transition-all duration-200 z-50
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          
          {/* User Info - With Avatar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName || 'User'}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="text-sm">{getInitials(userName)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-800 truncate">
                {userName}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {mounted ? userEmail : ''}
              </div>
            </div>
          </div>

          {/* Role Badge */}
          <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
            Signed in as{' '}
            <span className="capitalize font-medium text-gray-700">
              {role === 'citizen' ? 'Citizen' : role === 'volunteer' ? 'Volunteer' : role === 'admin' ? 'Administrator' : 'User'}
            </span>
          </div>

          {/* Menu Items */}
          <button
            onClick={handleProfileClick}
            className="w-full text-left cursor-pointer px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">👤</span>
            Your Profile
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left cursor-pointer px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-gray-100"
          >
            <span className="text-lg">🚪</span>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMenu;