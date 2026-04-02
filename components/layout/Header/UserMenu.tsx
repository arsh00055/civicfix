'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAppSelector } from '@/lib/store/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  Cog6ToothIcon,
  TrophyIcon,
  ArrowRightStartOnRectangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HomeIcon } from 'lucide-react';

interface UserMenuProps {
  role: string | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [userStats, setUserStats] = useState<{ points: number; level: number }>({ points: 0, level: 1 });
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
    // Fetch user stats (you can integrate with your API)
    const fetchUserStats = async () => {
      try {
        // Replace with actual API call
        // const response = await usersAPI.getUserStats(user?.id);
        // setUserStats(response.data);
        setUserStats({ points: 1240, level: 6 });
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      }
    };
    if (user?.id) fetchUserStats();
  }, [user?.id]);

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

  const handleAchievementsClick = () => {
    setIsOpen(false);
    router.push('/profile/achievements');
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    router.push('/profile/edit');
  };

  const handleDashboardClick = () => {
    setIsOpen(false);
    router.push('/');
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

  const userRole = role || 'user';
  const roleIcon = {
    citizen: '👤',
    volunteer: '🤝',
    admin: '👑',
  }[userRole] || '👤';

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl ${background}
          hover:opacity-90 cursor-pointer transition-all duration-200 shadow-md`}
      >
        {/* Avatar with pulse animation */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold backdrop-blur overflow-hidden">
            {userAvatar && !imageError ? (
              <img
                src={userAvatar}
                alt={userName || 'User'}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span>{getInitials(userName)}</span>
            )}
          </div>
          {userStats.points > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          )}
        </div>

        <div className="hidden md:block text-left">
          <p className="text-white font-medium text-sm leading-tight">
            {userName?.split(' ')[0] || 'User'}
          </p>
          <p className="text-white/70 text-xs capitalize">
            {roleIcon} {userRole}
          </p>
        </div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-72 origin-top-right z-50"
          >
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              {/* User Info Header */}
              <div className={`${background} px-4 py-4 text-white`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-semibold backdrop-blur overflow-hidden">
                    {userAvatar && !imageError ? (
                      <img
                        src={userAvatar}
                        alt={userName || 'User'}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span>{getInitials(userName)}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">
                      {userName || 'User'}
                    </h4>
                    <p className="text-white/80 text-xs truncate">
                      {mounted ? userEmail : ''}
                    </p>
                  </div>
                </div>
                
                {/* Stats Badge */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/20">
                  <div className="flex items-center gap-1">
                    <SparklesIcon className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm font-medium">{userStats.points} pts</span>
                  </div>
                  <div className="w-px h-4 bg-white/20" />
                  <div className="flex items-center gap-1">
                    <TrophyIcon className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm font-medium">Level {userStats.level}</span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={handleDashboardClick}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <HomeIcon className="w-4 h-4 text-gray-400" />
                  <span>Dashboard</span>
                </button>
                
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span>Your Profile</span>
                </button>
                
                <button
                  onClick={handleAchievementsClick}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <TrophyIcon className="w-4 h-4 text-gray-400" />
                  <span>Achievements</span>
                  {userStats.points > 0 && (
                    <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      +{userStats.points}
                    </span>
                  )}
                </button>
                
                {userRole === 'admin' && (
                  <button
                    onClick={handleSettingsClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Cog6ToothIcon className="w-4 h-4 text-gray-400" />
                    <span>Settings</span>
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;