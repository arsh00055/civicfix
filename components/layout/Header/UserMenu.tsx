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

  // Mark component as mounted to prevent hydration mismatch
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
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get the user email to display
  const userEmail = currentUser?.email || user?.email;

  return (
    <div className="relative" ref={menuRef}>
      
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl ${background}
          hover:opacity-90 cursor-pointer transition-all duration-200 shadow-md`}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold backdrop-blur">
          {getInitials(user?.name)}
        </div>

        <span className="hidden md:block text-white font-medium">
          {user?.name}
        </span>
      </button>

      {/* Dropdown */}
      <div
        className={`absolute right-0 mt-3 w-56 origin-top-right transform transition-all duration-200
        ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          
          {/* User Info - Fix hydration mismatch */}
          <div className="px-4 py-3 border-b text-sm">
            <div className="font-semibold text-gray-800 truncate">
              {mounted ? userEmail : ''}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Signed in as <span className="capitalize">{role || 'user'}</span>
            </div>
          </div>

          {/* Menu Items */}
          <button
            onClick={handleProfileClick}
            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            👤 Your Profile
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t"
          >
            🚪 Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMenu;