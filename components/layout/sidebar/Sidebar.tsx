'use client';

import React, { useState, useEffect } from 'react';
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

  const handleClose = () => dispatch(toggleSidebar());

  const handleLinkClick = () => {
    // Close sidebar on any link click (both mobile and desktop)
    dispatch(toggleSidebar());
  };

  const commonMenuItems = [
    { icon: HomeIcon, label: 'Dashboard', href: '/' },
    { icon: MapIcon, label: 'Community Map', href: '/map' },
    { icon: BellIcon, label: 'Notifications', href: '/notifications' },
  ];

  const roleSpecificItems = {
    citizen: [
      { icon: PlusCircleIcon, label: 'Report Issue', href: '/issues/new' },
      { icon: ClipboardDocumentListIcon, label: 'View Issues', href: '/issues' }, // ✅ Changed from 'My Reports'
      { icon: TrophyIcon, label: 'Achievements', href: '/profile/achievements' },
    ],
    volunteer: [
      { icon: PlusCircleIcon, label: 'Report Issue', href: '/issues/new' },
      { icon: ClipboardDocumentListIcon, label: 'Available Tasks', href: '/tasks/available' },
      { icon: ChartBarIcon, label: 'My Assignments', href: '/tasks/assignments' },
    ],
    admin: [
      { icon: UsersIcon, label: 'User Management', href: '/admin/user-management' },
      { icon: ChartBarIcon, label: 'Analytics', href: '/admin/analytics' },
      { icon: Cog6ToothIcon, label: 'System Settings', href: '/admin/settings' },
    ],
  };

  const supportItems = [
    { icon: QuestionMarkCircleIcon, label: 'Help & Support', href: '/help' },
  ];

  // Remove duplicate common menu items that might appear in role-specific
  const commonMenuItemsFiltered = commonMenuItems.filter(
    commonItem => !roleSpecificItems[userRole as keyof typeof roleSpecificItems]?.some(
      roleItem => roleItem.href === commonItem.href
    )
  );

  const menuItems = [
    ...commonMenuItemsFiltered,
    ...(roleSpecificItems[userRole as keyof typeof roleSpecificItems] || []),
  ];

  return (
    <>
      {/* Overlay for both mobile and desktop when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleClose}
        />
      )}

      {/* Sidebar - Only show when sidebarOpen is true */}
      {sidebarOpen && (
        <aside 
          className="
            h-screen w-64 bg-white border-r border-gray-200 shadow-xl 
            flex flex-col fixed left-0 top-0 z-50
            animate-slideIn
          "
        >
          {/* Close Button for both mobile and desktop */}
          <div className="lg:hidden flex justify-end p-4 border-b border-gray-200">
            <button 
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <SidebarHeader />

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
              Navigation
            </p>

            {menuItems.map((item) => (
              <SidebarItem
                key={item.href}
                {...item}
                onClick={handleLinkClick}
              />
            ))}
          </nav>

          <nav className="px-3 py-2 border-t border-gray-200">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
              Support
            </p>

            {supportItems.map((item) => (
              <SidebarItem
                key={item.href}
                {...item}
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
              className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group mt-2"
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