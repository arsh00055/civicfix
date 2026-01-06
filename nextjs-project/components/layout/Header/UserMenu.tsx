'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { UserIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '@/lib/store/hooks';

interface UserMenuProps {
  role: string | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className={`relative ${background} cursor-pointer rounded-md p-2 hover:opacity-90 transition-opacity`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 text-sm rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500"
        aria-label="User menu"
      >
        <UserIcon className="w-6 h-6 text-white" />
        <span className="hidden md:block text-white font-medium">
          {currentUser?.name || user?.name || 'User'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
            <div className="font-medium text-gray-700">{currentUser?.email || user?.email}</div>
            <div className="mt-1">Signed in as {role || 'user'}</div>
          </div>
          <button
            onClick={handleProfileClick}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Your Profile
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors border-t border-gray-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;