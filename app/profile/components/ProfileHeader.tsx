'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/types';
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import { formatDate } from '@/lib/utils/helpers/formatters';

interface ProfileHeaderProps {
  user: UserProfile;
  stats?: {
    issuesReported: number;
    issuesResolved: number;
    communityScore: number;
  };
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, stats }) => {
  const router = useRouter();

  // 👇 ROLE-BASED COLORS
  const getRoleColors = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          badge: 'bg-purple-100 text-purple-800 border-purple-200',
          cover: 'from-purple-600 to-indigo-700',
          avatarBg: 'from-purple-500 to-indigo-600',
          button: 'bg-purple-600 hover:bg-purple-700'
        };
      case 'volunteer':
        return {
          badge: 'bg-green-100 text-green-800 border-green-200',
          cover: 'from-green-600 to-emerald-700',
          avatarBg: 'from-green-500 to-emerald-600',
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'citizen':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          cover: 'from-blue-600 to-indigo-700',
          avatarBg: 'from-blue-500 to-indigo-600',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          cover: 'from-gray-600 to-gray-700',
          avatarBg: 'from-gray-500 to-gray-600',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'volunteer': return 'Volunteer';
      case 'citizen': return 'Community Citizen';
      default: return 'User';
    }
  };

  const getFullName = () => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.name || 'User';
  };

  const getInitials = () => {
    const fullName = getFullName();
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const roleColors = getRoleColors(user.role);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 👇 ROLE-BASED COVER IMAGE */}
      <div className={`h-32 bg-gradient-to-r ${roleColors.cover}`}></div>

      <div className="px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={getFullName()}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/avatar-placeholder.png';
                  }}
                />
              ) : (
                // 👇 ROLE-BASED AVATAR BACKGROUND
                <div className={`w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br ${roleColors.avatarBg} flex items-center justify-center`}>
                  <span className="text-white text-3xl font-bold">{getInitials()}</span>
                </div>
              )}
              {user.verification?.identity && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3 flex-wrap gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{getFullName()}</h1>
                {/* 👇 ROLE-BASED BADGE */}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors.badge}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
              
              <p className="text-gray-600">{user.email}</p>
              
              {user.bio && (
                <p className="text-gray-700 max-w-2xl">{user.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                <span>Joined {formatDate(user.joinDate)}</span>
                {user.phone && <span>• 📞 {user.phone}</span>}
                {user.address && <span>• 📍 {user.address.street}, {user.address.city}</span>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <PrimaryButton
              onClick={() => router.push('/profile/edit')}
              className={`${roleColors.button} text-white`}
            >
              Edit Profile
            </PrimaryButton>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.issuesReported}</div>
              <div className="text-sm text-gray-600">Issues Reported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.issuesResolved}</div>
              <div className="text-sm text-gray-600">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.communityScore}%</div>
              <div className="text-sm text-gray-600">Community Score</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;