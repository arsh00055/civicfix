'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/types';
import { 
  UserIcon, 
  MapIcon, 
  ShieldCheckIcon,
  CogIcon,
  TrophyIcon,
  BellIcon,
  ChartBarIcon
} from '@/components/UI/icons';

interface ProfileSidebarProps {
  user: UserProfile;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user }) => {
  const router = useRouter();

  const menuItems = [
    { icon: UserIcon, label: 'Profile Overview', href: '/profile' },
    { icon: CogIcon, label: 'Edit Profile', href: '/profile/edit' },
    { icon: TrophyIcon, label: 'Achievements', href: '/profile/achievements' },
    { icon: MapIcon, label: 'Location Settings', href: '/profile/location' },
    { icon: ShieldCheckIcon, label: 'Privacy & Security', href: '/profile/privacy' },
    { icon: BellIcon, label: 'Notifications', href: '/notifications' },
    { icon: ChartBarIcon, label: 'Statistics', href: '/profile/stats' },
  ];

  const verificationItems = [
    { label: 'Email', verified: user.verification?.email, icon: '✉️' },
    { label: 'Phone', verified: user.verification?.phone, icon: '📱' },
    { label: 'Identity', verified: user.verification?.identity, icon: '🆔' },
  ];

  const handleMenuItemClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Menu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
        <nav className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.href}
              onClick={() => handleMenuItemClick(item.href)}
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Verification Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
        <div className="space-y-3">
          {verificationItems.map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              {item.verified ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Verified
                </span>
              ) : (
                <button 
                  onClick={() => router.push('/profile/verification')}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors"
                >
                  Verify
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills (for volunteers) */}
      {user.role === 'volunteer' && user.skills && user.skills.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.slice(0, 5).map(skill => (
              <span
                key={skill}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
              >
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
            onClick={() => router.push('/profile/edit#skills')}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700"
          >
            Edit Skills
          </button>
        </div>
      )}

      {/* Availability (for volunteers) */}
      {user.role === 'volunteer' && Array.isArray(user.availability) && user.availability.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
          <div className="space-y-2">
            {user.availability.slice(0, 3).map(
              (slot: { days?: string[]; hours?: { start: string; end: string }; timezone?: string }, idx: number) => (
                <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>
                    {Array.isArray(slot.days) ? slot.days.join(', ') : ''}{' '}
                  {slot.hours ? `(${slot.hours.start} - ${slot.hours.end})` : ''}{' '}
                  {slot.timezone ? slot.timezone : ''}
                </span>
              </div>
            ))}
            {user.availability.length > 3 && (
              <div className="text-sm text-gray-500">
                +{user.availability.length - 3} more time slots
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSidebar;