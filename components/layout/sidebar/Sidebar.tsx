// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
// import { toggleSidebar } from '@/lib/store/slices/uiSlice';
// import { useAuth } from '@/features/auth/hooks/useAuth';
// import SidebarHeader from './SidebarHeader';
// import SidebarItem from './SidebarItem';
// import Link from 'next/link';
// import {
//   HomeIcon,
//   MapIcon,
//   UserIcon,
//   PlusCircleIcon,
//   ClipboardDocumentListIcon,
//   ChartBarIcon,
//   UsersIcon,
//   Cog6ToothIcon,
//   ArrowRightStartOnRectangleIcon,
//   TrophyIcon,
//   BellIcon,
//   QuestionMarkCircleIcon,
//   XMarkIcon,
//   FlagIcon,
//   ChatBubbleLeftRightIcon,
//   MegaphoneIcon,
// } from '@heroicons/react/24/outline';
// import { MedalIcon } from 'lucide-react';

// const Sidebar: React.FC = () => {
//   const dispatch = useAppDispatch();
//   const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
//   const { userRole, logout, user } = useAuth();

//   const handleClose = () => dispatch(toggleSidebar());

//   const handleLinkClick = () => {
//     dispatch(toggleSidebar());
//   };

//   const commonMenuItems = [
//     { icon: HomeIcon, label: 'Dashboard', href: '/' },
//     { icon: MapIcon, label: 'Community Map', href: '/map' },
//     { icon: BellIcon, label: 'Notifications', href: '/notifications' },
//     { icon: ChatBubbleLeftRightIcon, label: 'Community Polls', href: '/polls' },
//     { icon: MegaphoneIcon, label: 'Community Board', href: '/bulletin' },
//     { icon: MedalIcon, label: 'Leaderboard', href: '/leaderboard'},
//   ];

//   const roleSpecificItems = {
//     citizen: [
//       { icon: PlusCircleIcon, label: 'Report Issue', href: '/issues/new' },
//       { icon: ClipboardDocumentListIcon, label: 'View Issues', href: '/issues' },
//       { icon: TrophyIcon, label: 'Achievements', href: '/profile/achievements' },
//     ],
//     volunteer: [
//       { icon: PlusCircleIcon, label: 'Report Issue', href: '/issues/new' },
//       { icon: ClipboardDocumentListIcon, label: 'Available Tasks', href: '/tasks/available' },
//       { icon: ChartBarIcon, label: 'My Assignments', href: '/tasks/assignments' },
//     ],
//     admin: [
//       { icon: FlagIcon, label: 'Manage Issues', href: '/admin/issues' },
//       { icon: UsersIcon, label: 'User Management', href: '/admin/user-management' },
//       { icon: ChartBarIcon, label: 'Analytics', href: '/admin/analytics' },
//       { icon: Cog6ToothIcon, label: 'System Settings', href: '/admin/settings' },
//     ],
//   };

//   const supportItems = [
//     { icon: QuestionMarkCircleIcon, label: 'Help & Support', href: '/help' },
//   ];

//   const commonMenuItemsFiltered = commonMenuItems.filter(
//     commonItem => !roleSpecificItems[userRole as keyof typeof roleSpecificItems]?.some(
//       roleItem => roleItem.href === commonItem.href
//     )
//   );

//   const menuItems = [
//     ...commonMenuItemsFiltered,
//     ...(roleSpecificItems[userRole as keyof typeof roleSpecificItems] || []),
//   ];

//   return (
//     <>
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40"
//           onClick={handleClose}
//         />
//       )}

//       {sidebarOpen && (
//         <aside 
//           className="
//             h-screen w-64 bg-white border-r border-gray-200 shadow-xl 
//             flex flex-col fixed left-0 top-0 z-50
//             animate-slideIn
//           "
//         >
//           <div className="lg:hidden flex justify-end p-4 border-b border-gray-200">
//             <button 
//               onClick={handleClose}
//               className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
//             >
//               <XMarkIcon className="h-5 w-5 text-gray-600" />
//             </button>
//           </div>

//           <SidebarHeader />

//           <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
//             <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
//               Navigation
//             </p>

//             {menuItems.map((item) => (
//               <SidebarItem
//                 key={item.href}
//                 {...item}
//                 onClick={handleLinkClick}
//               />
//             ))}
//           </nav>

//           <nav className="px-3 py-2 border-t border-gray-200">
//             <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
//               Support
//             </p>

//             {supportItems.map((item) => (
//               <SidebarItem
//                 key={item.href}
//                 {...item}
//                 onClick={handleLinkClick}
//               />
//             ))}
//           </nav>

//           <div className="p-4 border-t border-gray-200 bg-white">
//             <SidebarItem
//               icon={UserIcon}
//               label="My Profile"
//               href="/profile"
//               onClick={handleLinkClick}
//             />

//             <button
//               onClick={logout}
//               className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group mt-2"
//             >
//               <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-3 text-gray-500 group-hover:text-red-500" />
//               <span className="font-medium group-hover:text-red-600">Logout</span>
//             </button>
//           </div>
//         </aside>
//       )}
//     </>
//   );
// };

// export default Sidebar;



'use client';

import React from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { toggleSidebar } from '@/lib/store/slices/uiSlice';
import { useAuth } from '@/features/auth/hooks/useAuth';
import SidebarHeader from './SidebarHeader';
import SidebarItem from './SidebarItem';
import {
  HomeIcon,
  MapIcon,
  UserIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  TrophyIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  FlagIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import { MedalIcon } from 'lucide-react';

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const { userRole, logout, user } = useAuth();

  const handleClose = () => dispatch(toggleSidebar());
  const handleLinkClick = () => dispatch(toggleSidebar());

  const commonMenuItems = [
    { icon: HomeIcon, label: 'Dashboard', href: '/' },
    { icon: MapIcon, label: 'Community Map', href: '/map' },
    { icon: BellIcon, label: 'Notifications', href: '/notifications' },
    { icon: ChatBubbleLeftRightIcon, label: 'Community Polls', href: '/polls' },
    { icon: MegaphoneIcon, label: 'Community Board', href: '/bulletin' },
    { icon: MedalIcon, label: 'Leaderboard', href: '/leaderboard' },
  ];

  const roleSpecificItems = {
    citizen: [
      { icon: PlusCircleIcon, label: 'Report Issue', href: '/issues/new' },
      { icon: ClipboardDocumentListIcon, label: 'View Issues', href: '/issues' },
      { icon: TrophyIcon, label: 'Achievements', href: '/profile/achievements' },
    ],
    volunteer: [
      { icon: PlusCircleIcon, label: 'Report Issue', href: '/issues/new' },
      { icon: ClipboardDocumentListIcon, label: 'Available Tasks', href: '/tasks/available' },
      { icon: ChartBarIcon, label: 'My Assignments', href: '/tasks/assignments' },
    ],
    admin: [
      { icon: FlagIcon, label: 'Manage Issues', href: '/admin/issues' },
      { icon: UsersIcon, label: 'User Management', href: '/admin/user-management' },
      { icon: ChartBarIcon, label: 'Analytics', href: '/admin/analytics' },
      { icon: Cog6ToothIcon, label: 'System Settings', href: '/admin/settings' },
    ],
  };

  const supportItems = [
    { icon: QuestionMarkCircleIcon, label: 'Help & Support', href: '/help' },
  ];

  const commonMenuItemsFiltered = commonMenuItems.filter(
    commonItem => !roleSpecificItems[userRole as keyof typeof roleSpecificItems]?.some(
      roleItem => roleItem.href === commonItem.href
    )
  );

  const menuItems = [
    ...commonMenuItemsFiltered,
    ...(roleSpecificItems[userRole as keyof typeof roleSpecificItems] || []),
  ];

  // User display info
  const userName = (user as any)?.firstName || (user as any)?.name || 'My Profile';
  let userAvatar = (user as any)?.avatar;
if (userAvatar?.startsWith('/upload/')) {
  userAvatar = `/api${userAvatar}`;
}
  const userInitial = userName.charAt(0).toUpperCase();

  const roleColors: Record<string, string> = {
    admin: 'from-purple-500 to-indigo-600',
    volunteer: 'from-green-500 to-emerald-600',
    citizen: 'from-blue-500 to-indigo-600',
  };
  const avatarGradient = roleColors[userRole || 'citizen'] || roleColors.citizen;

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      )}

      {sidebarOpen && (
        <aside className="h-screen w-64 overflow-y-auto bg-white border-r border-gray-200 shadow-xl flex flex-col fixed left-0 top-0 z-50 animate-slideIn">
          
          {/* Close button - mobile */}
          <div className="lg:hidden flex justify-end p-4 border-b border-gray-200">
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <SidebarHeader />

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Navigation</p>
            {menuItems.map((item) => (
              <SidebarItem key={item.href} {...item} onClick={handleLinkClick} />
            ))}
          </nav>

          {/* Support */}
          <nav className="px-3 py-2 border-t border-gray-200">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Support</p>
            {supportItems.map((item) => (
              <SidebarItem key={item.href} {...item} onClick={handleLinkClick} />
            ))}
          </nav>

          {/* Profile + Logout */}
          <div className="p-4 border-t border-gray-200 bg-white">

            {/* My Profile with Avatar */}
            <Link
              href="/profile"
              onClick={handleLinkClick}
              className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group mb-2"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-9 h-9 rounded-full mr-3 object-cover border-2 border-gray-200 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className={`w-9 h-9 rounded-full mr-3 bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {userInitial}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900 truncate">
                  {userName}
                </span>
                <span className="text-xs text-gray-400 capitalize">{userRole}</span>
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
            >
              <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-3 text-gray-500 group-hover:text-red-500" />
              <span className="font-medium group-hover:text-red-600">Logout</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
};

export default Sidebar;