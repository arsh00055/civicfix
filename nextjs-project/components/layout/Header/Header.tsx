'use client';

import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { toggleSidebar } from '@/lib/store/slices/uiSlice';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface HeaderProps {
  userRole: string | null;
}

const Header: React.FC<HeaderProps> = ({ userRole }) => {
  const dispatch = useAppDispatch();
  const [background, setBackground] = useState<string>('');
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  const getBackground = useCallback(() => {
    switch (userRole) {
      case 'citizen':
        return 'bg-gradient-to-r from-blue-600 to-indigo-700';
      case 'volunteer':
        return 'bg-gradient-to-r from-green-600 to-emerald-700';
      case 'admin':
        return 'bg-gradient-to-r from-purple-600 to-indigo-700';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  }, [userRole]);

  useEffect(() => {
    setBackground(getBackground());
  }, [getBackground]);

  const handleMenuClick = () => {
    dispatch(toggleSidebar());
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleMenuClick}
            className={`p-2 rounded-md text-white cursor-pointer ${background} transition-colors`}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-800 lg:ml-0">
            Hi 👋
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <NotificationBell />
          <UserMenu role={userRole} />
        </div>
      </div>
    </header>
  );
};

export default Header;