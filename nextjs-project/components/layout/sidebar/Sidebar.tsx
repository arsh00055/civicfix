'use client';

import React from 'react';
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
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const { userRole, logout } = useAuth();

  const handleClose = () => {
    dispatch(toggleSidebar());
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      dispatch(toggleSidebar());
    }
  };

  const commonMenuItems = [
    { icon: HomeIcon, label: 'Dashboard', href: '/', badge: null },
    { icon: MapIcon, label: 'Community Map', href: '/map', badge: null },
    { icon: BellIcon, label: 'Notifications', href: '/notifications', badge: null },
  ];

  const roleSpecificItems = {
    citizen: [
      { icon: PlusCircleIcon, label: 'Report Issue', href: '/issues/new', badge: null },
      { icon: ClipboardDocumentListIcon, label: 'My Reports', href: '/issues', badge: null },
      { icon: TrophyIcon, label: 'Achievements', href: '/profile/achievements', badge: null },
    ],
    volunteer: [
      { icon: PlusCircleIcon, label: 'Report Issue', href: '/issues/new', badge: null },
      { icon: ClipboardDocumentListIcon, label: 'Available Tasks', href: '/tasks/available', badge: null },
      { icon: ChartBarIcon, label: 'My Assignments', href: '/tasks/assignments', badge: null },
    ],
    admin: [
      { icon: UsersIcon, label: 'User Management', href: '/user-management', badge: null },
      { icon: ChartBarIcon, label: 'Analytics', href: '/admin/analytics', badge: null },
      { icon: Cog6ToothIcon, label: 'System Settings', href: '/admin/settings', badge: null },
    ],
  };

  const supportItems = [
    { icon: QuestionMarkCircleIcon, label: 'Help & Support', href: '/help', badge: null },
  ];

  const menuItems = [
    ...commonMenuItems,
    ...(roleSpecificItems[userRole as keyof typeof roleSpecificItems] || [])
  ];

  return (
    <>
      {/* Mobile Overlay - Only show when sidebar is open on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
          border-r border-gray-200
          lg:w-64
        `}
        aria-label="Sidebar"
      >
        <div className="flex flex-col min-h-screen">
          {/* Close Button - Mobile Only */}
          <div className="lg:hidden flex justify-end p-4 border-b border-gray-200">
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <SidebarHeader />
          
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <div className="px-3 py-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Navigation
              </span>
            </div>
            {menuItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                badge={item.badge}
                onClick={handleLinkClick}
              />
            ))}
          </nav>

          <nav className="px-3 py-2 border-t border-gray-200">
            <div className="px-3 py-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Support
              </span>
            </div>
            {supportItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                badge={item.badge}
                onClick={handleLinkClick}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 bg-white">
            <SidebarItem
              icon={UserIcon}
              label="My Profile"
              href="/profile"
              onClick={handleLinkClick}
            />
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group mt-2"
              aria-label="Logout"
            >
              <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-3 text-gray-500 group-hover:text-red-500" />
              <span className="group-hover:text-red-600">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;