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
import { HomeIcon, UsersIcon } from 'lucide-react';
import apiClient from '@/lib/services/api/client';
import { usersAPI } from '@/lib/services/api/endpoints';

interface UserMenuProps {
  role: string | null;
}

interface UserStats {
  points: number;
  level: number;
  // citizen
  totalReports?: number;
  resolvedReports?: number;
  totalVotes?: number;
  totalComments?: number;
  reputation?: number;
  unlockedAchievements?: number;
  // volunteer
  tasksCompleted?: number;
  totalClaimed?: number;
  pointsEarned?: number;
  rating?: number;
  totalRatings?: number;
  // admin (platform-wide aggregates)
  totalIssues?: number;
  resolvedIssues?: number;
  totalUsers?: number;
}

const UserMenu: React.FC<UserMenuProps> = ({ role }) => {
  const [isOpen, setIsOpen]       = useState(false);
  const [mounted, setMounted]     = useState(false);
  const [imageError, setImageError] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({ points: 0, level: 1 });
  const [statsLoading, setStatsLoading] = useState(false);
  const { user, logout }          = useAuth();
  const router                    = useRouter();
  const menuRef                   = useRef<HTMLDivElement>(null);
  const currentUser               = useAppSelector((state) => state.auth.user);

  const getBackground = useCallback(() => {
    switch (role) {
      case 'citizen':   return 'bg-gradient-to-r from-blue-600 to-indigo-700';
      case 'volunteer': return 'bg-gradient-to-r from-green-600 to-emerald-700';
      case 'admin':     return 'bg-gradient-to-r from-purple-600 to-indigo-700';
      default:          return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  }, [role]);

  const background = getBackground();

  // ── Fetch real stats ──────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await usersAPI.getUserStats();
        const data = res.data;
        setUserStats({
          points:               data.points               ?? 0,
          level:                data.level                ?? 1,
          // citizen fields
          totalReports:         data.totalReports,
          resolvedReports:      data.resolvedReports,
          totalVotes:           data.totalVotes,
          totalComments:        data.totalComments,
          reputation:           data.reputation,
          unlockedAchievements: data.unlockedAchievements,
          // volunteer fields
          tasksCompleted:       data.tasksCompleted,
          totalClaimed:         data.totalClaimed,
          pointsEarned:         data.pointsEarned,
          rating:               data.rating,
          totalRatings:         data.totalRatings,
          // admin fields
          totalIssues:          data.totalIssues,
          resolvedIssues:       data.resolvedIssues,
          totalUsers:           data.totalUsers,
        });
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
        // Keep defaults — non-fatal
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  // ── Click outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleProfileClick      = () => { setIsOpen(false); router.push('/profile'); };
  const handleAchievementsClick = () => { setIsOpen(false); router.push('/profile/achievements'); };
  const handleSettingsClick     = () => { setIsOpen(false); router.push('/profile/edit'); };
  const handleDashboardClick    = () => { setIsOpen(false); router.push('/'); };
  const handleLogout            = async () => { setIsOpen(false); await logout(); router.push('/login'); };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Resolve user data
  const userData   = currentUser || user;
  const userEmail  = userData?.email;
  const userName   = userData?.name;
  let userAvatar   = userData?.avatar;
  if (userAvatar && !userAvatar.startsWith('http') && !userAvatar.startsWith('/')) {
    userAvatar = `/${userAvatar}`;
  }

  const userRole = role || 'user';
  const roleIcon = ({ citizen: '👤', volunteer: '🤝', admin: '👑' } as Record<string, string>)[userRole] || '👤';

  // Role-specific stat line shown in header
  const statLine = () => {
    if (role === 'volunteer') {
      return (
        <>
          <div className="flex items-center gap-1">
            <SparklesIcon className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">{userStats.points} pts</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-1">
            <TrophyIcon className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">
              {userStats.tasksCompleted ?? 0} tasks
            </span>
          </div>
          {(userStats.rating ?? 0) > 0 && (
            <>
              <div className="w-px h-4 bg-white/20" />
              <span className="text-sm font-medium">⭐ {userStats.rating}</span>
            </>
          )}
        </>
      );
    }
    if (role === 'admin') {
      return (
        <>
          <div className="flex items-center gap-1">
            <UsersIcon className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">{userStats.totalUsers ?? 0} users</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-1">
            <TrophyIcon className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">{userStats.resolvedIssues ?? 0} resolved</span>
          </div>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-1">
            <SparklesIcon className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">{userStats.totalIssues ?? 0} issues</span>
          </div>
        </>
      );
    }
    // citizen (default)
    return (
      <>
        <div className="flex items-center gap-1">
          <SparklesIcon className="w-4 h-4 text-yellow-300" />
          <span className="text-sm font-medium">{userStats.points} pts</span>
        </div>
        <div className="w-px h-4 bg-white/20" />
        <div className="flex items-center gap-1">
          <TrophyIcon className="w-4 h-4 text-yellow-300" />
          <span className="text-sm font-medium">Level {userStats.level}</span>
        </div>
      </>
    );
  };

  const menuVariants = {
    hidden:  { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1,    y: 0    },
    exit:    { opacity: 0, scale: 0.95, y: -10  },
  };

  const AvatarDisplay = ({ size }: { size: 'sm' | 'lg' }) => {
    const cls = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-lg';
    // Always render initials on the server (mounted=false) so SSR and the
    // initial client paint agree. Once mounted=true we switch to the avatar
    // image if one is available. This eliminates the hydration mismatch.
    const showImage = mounted && !!userAvatar && !imageError;
    return (
      <div className={`${cls} rounded-full bg-white/20 flex items-center justify-center text-white font-semibold backdrop-blur overflow-hidden`}>
        {showImage ? (
          <img src={userAvatar!} alt={userName || 'User'} className="w-full h-full object-cover" onError={() => setImageError(true)} />
        ) : (
          <span>{getInitials(mounted ? userName : undefined)}</span>
        )}
      </div>
    );
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* ── Trigger ── */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl ${background} hover:opacity-90 cursor-pointer transition-all duration-200 shadow-md`}
      >
        <div className="relative">
          <AvatarDisplay size="sm" />
          {mounted && userStats.points > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-white font-medium text-sm leading-tight">
            {mounted ? (userName?.split(' ')[0] || 'User') : 'User'}
          </p>
          <p className="text-white/70 text-xs capitalize">
            {mounted ? `${roleIcon} ${userRole}` : userRole}
          </p>
        </div>
      </motion.button>

      {/* ── Dropdown ── */}
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

              {/* Header */}
              <div className={`${background} px-4 py-4 text-white`}>
                <div className="flex items-center gap-3">
                  <AvatarDisplay size="lg" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{userName || 'User'}</h4>
                    <p className="text-white/80 text-xs truncate">{mounted ? userEmail : ''}</p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/20">
                  {statsLoading ? (
                    <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
                  ) : (
                    statLine()
                  )}
                </div>
              </div>

              {/* Menu items */}
              <div className="py-2">
                <button onClick={handleDashboardClick} className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <HomeIcon className="w-4 h-4 text-gray-400" />
                  <span>Dashboard</span>
                </button>

                <button onClick={handleProfileClick} className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span>Your Profile</span>
                </button>

                <button onClick={handleAchievementsClick} className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <TrophyIcon className="w-4 h-4 text-gray-400" />
                  <span>Achievements</span>
                  {(userStats.unlockedAchievements ?? 0) > 0 && (
                    <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      {userStats.unlockedAchievements} unlocked
                    </span>
                  )}
                </button>

                {userRole === 'admin' && (
                  <button onClick={handleSettingsClick} className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Cog6ToothIcon className="w-4 h-4 text-gray-400" />
                    <span>Settings</span>
                  </button>
                )}
              </div>

              <div className="border-t border-gray-100" />

              <button onClick={handleLogout} className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
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