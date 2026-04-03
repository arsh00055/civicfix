'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile } from '@/types';
import {
  UserIcon,
  MapIcon,
  ShieldCheckIcon,
  CogIcon,
  TrophyIcon,
  BellIcon,
  ChartBarIcon,
} from '@/components/UI/icons';

interface ProfileSidebarProps {
  user: UserProfile;
  onVerificationSuccess?: (type: 'email' | 'phone' | 'identity') => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user }) => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { icon: UserIcon, label: 'Profile Overview', href: '/profile' },
    { icon: CogIcon, label: 'Edit Profile', href: '/profile/edit' },
    { icon: TrophyIcon, label: 'Achievements', href: '/profile/achievements' },
    { icon: MapIcon, label: 'Location Settings', href: '/profile/location' },
    { icon: ShieldCheckIcon, label: 'Privacy & Security', href: '/profile/privacy' },
    { icon: BellIcon, label: 'Notifications', href: '/notifications' },
    { icon: ChartBarIcon, label: 'Statistics', href: '/profile/stats' },
  ];

  const isEmailVerified = (user as any).isEmailVerified || false;

  return (
    <div className="space-y-6">
      {/* Navigation Menu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ✅ Email verified badge - menu ਦੇ ਹੇਠਾਂ */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-sm">✉️</span>
            <span className="text-xs text-gray-500 truncate">{(user as any).email}</span>
            {isEmailVerified ? (
              <span className="ml-auto text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full shrink-0">
                ✓ Verified
              </span>
            ) : (
              <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full shrink-0">
                ⚠ Unverified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Skills (volunteers only) */}
      {user.role === 'volunteer' && user.skills && user.skills.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.slice(0, 5).map((skill) => (
              <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {skill}
              </span>
            ))}
            {user.skills.length > 5 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                +{user.skills.length - 5} more
              </span>
            )}
          </div>
          <button
            onClick={() => router.push('/profile/edit')}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700"
          >
            Edit Skills
          </button>
        </div>
      )}

      {/* Availability (volunteers only) */}
      {user.role === 'volunteer' && Array.isArray(user.availability) && user.availability.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
          <div className="space-y-2">
            {user.availability.slice(0, 3).map((slot: any, idx: number) => (
              <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>
                  {Array.isArray(slot.days) ? slot.days.join(', ') : ''}{' '}
                  {slot.hours ? `(${slot.hours.start} - ${slot.hours.end})` : ''}{' '}
                  {slot.timezone || ''}
                </span>
              </div>
            ))}
            {user.availability.length > 3 && (
              <div className="text-sm text-gray-500">+{user.availability.length - 3} more time slots</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSidebar;