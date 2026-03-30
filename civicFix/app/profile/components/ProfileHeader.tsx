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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'volunteer': return 'bg-green-100 text-green-800 border border-green-200';
      case 'citizen': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

      <div className="px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <img
                src={user.avatar || '/images/avatar-placeholder.png'}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              {user.verification?.identity && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
              
              <p className="text-gray-600">{user.email}</p>
              
              {user.bio && (
                <p className="text-gray-700 max-w-2xl">{user.bio}</p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Joined {formatDate(user.joinDate)}</span>
                {user.phone && <span>• {user.phone}</span>}
                {user.address && <span>• {user.address.street}, {user.address.state}, {user.address.city}, {user.address.country}, {user.address.zipCode}</span>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <PrimaryButton
              onClick={() => router.push('/profile/edit')}
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