'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  UserIcon, MapIcon, ShieldCheckIcon, CogIcon,
  TrophyIcon, BellIcon, ChartBarIcon,
} from '@/components/UI/icons';
import { UserProfile } from '@/types/user.types';

interface ProfileSidebarProps {
  user: UserProfile;
  onVerificationSuccess?: (type: 'email' | 'phone' | 'identity') => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user }) => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { icon: UserIcon, label: 'Profile Overview', href: '/profile', description: 'Your public profile' },
    { icon: CogIcon, label: 'Edit Profile', href: '/profile/edit', description: 'Update your info' },
    { icon: TrophyIcon, label: 'Achievements', href: '/profile/achievements', description: 'Badges & rewards' },
    { icon: MapIcon, label: 'Location Settings', href: '/profile/location', description: 'Your area' },
    { icon: ShieldCheckIcon, label: 'Privacy & Security', href: '/profile/privacy', description: 'Account safety' },
    { icon: BellIcon, label: 'Notifications', href: '/notifications', description: 'Alerts & updates' },
    { icon: ChartBarIcon, label: 'Statistics', href: '/profile/stats', description: 'Your activity data' },
  ];

  const isEmailVerified = (user as any).verification?.email || (user as any).isEmailVerified || false;
  const role = (user as any).role;

  const getRoleConfig = () => {
    switch (role) {
      case 'admin':
        return {
          gradient: 'from-violet-600 to-purple-700',
          activeBg: 'bg-violet-600',
          activeText: 'text-white',
          activeIcon: 'text-white',
          hoverBg: 'hover:bg-violet-50',
          skillTag: 'bg-violet-50 text-violet-700 border-violet-100',
        };
      case 'volunteer':
        return {
          gradient: 'from-emerald-500 to-teal-600',
          activeBg: 'bg-emerald-600',
          activeText: 'text-white',
          activeIcon: 'text-white',
          hoverBg: 'hover:bg-emerald-50',
          skillTag: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        };
      default:
        return {
          gradient: 'from-blue-600 to-indigo-700',
          activeBg: 'bg-blue-600',
          activeText: 'text-white',
          activeIcon: 'text-white',
          hoverBg: 'hover:bg-blue-50',
          skillTag: 'bg-blue-50 text-blue-700 border-blue-100',
        };
    }
  };

  const rc = getRoleConfig();

  return (
    <div className="space-y-4">
      {/* Navigation Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Top accent bar */}
        <div className={`h-1 bg-gradient-to-r ${rc.gradient}`} />

        {/* Email row */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="text-base shrink-0">✉️</span>
            <span className="text-xs text-gray-500 truncate flex-1 font-medium">
              {(user as any).email}
            </span>
            {isEmailVerified ? (
              <span className="shrink-0 inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-200">
                ✓
              </span>
            ) : (
              <span className="shrink-0 inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full border border-red-200">
                ⚠
              </span>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="p-2 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`group flex items-center cursor-pointer gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                  isActive
                    ? `${rc.activeBg} shadow-sm`
                    : `text-gray-600 ${rc.hoverBg} hover:text-gray-900`
                }`}
              >
                <item.icon
                  className={`h-[1.1rem] w-[1.1rem] shrink-0 ${
                    isActive ? rc.activeIcon : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-semibold truncate ${
                      isActive ? rc.activeText : ''
                    }`}
                  >
                    {item.label}
                  </div>
                  {!isActive && (
                    <div className="text-xs text-gray-400 truncate">{item.description}</div>
                  )}
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Skills card — volunteers only */}
      {role === 'volunteer' && user.skills && user.skills.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
              Skills
            </h3>
            <button
              onClick={() => router.push('/profile/edit')}
              className="text-xs text-emerald-600 cursor-pointer hover:text-emerald-700 font-bold"
            >
              Edit
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${rc.skillTag}`}
              >
                {skill}
              </span>
            ))}
            {user.skills.length > 6 && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-lg">
                +{user.skills.length - 6}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Availability card — volunteers only */}
      {role === 'volunteer' &&
        Array.isArray(user.availability) &&
        user.availability.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">
              Availability
            </h3>
            <div className="space-y-2">
              {user.availability.slice(0, 3).map((slot: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full shrink-0" />
                  <span>
                    {Array.isArray(slot.days) ? slot.days.join(', ') : ''}
                    {slot.hours ? ` (${slot.hours.start}–${slot.hours.end})` : ''}
                  </span>
                </div>
              ))}
              {user.availability.length > 3 && (
                <p className="text-xs text-gray-400">
                  +{user.availability.length - 3} more slots
                </p>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default ProfileSidebar;