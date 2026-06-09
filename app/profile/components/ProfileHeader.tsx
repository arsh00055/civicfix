'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils/helpers/formatters';
import { PencilIcon, MapPinIcon, PhoneIcon, CalendarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { UserProfile } from '@/types/user.types';

interface ProfileHeaderProps {
  user: UserProfile;
  stats?: {
    issuesReported: number;
    issuesResolved: number;
    communityScore: number;
    achievements?: number;
  };
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, stats }) => {
  const router = useRouter();
  const [avatarError, setAvatarError] = useState(false);

  const getFullName = () => {
    if (user.firstName || user.lastName) return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return user.name || 'User';
  };

  const getInitials = () =>
    getFullName().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getRoleConfig = () => {
    switch ((user as any).role) {
      case 'admin':
        return {
          label: 'Administrator',
          gradient: 'from-violet-600 to-purple-700',
          accentBg: 'bg-violet-600',
          badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
          statBg: 'bg-violet-50',
          statBorder: 'border-violet-100',
          buttonBg: 'bg-violet-600 hover:bg-violet-700',
          coverFrom: '#7c3aed',
          coverTo: '#6d28d9',
        };
      case 'volunteer':
        return {
          label: 'Volunteer',
          gradient: 'from-emerald-500 to-teal-600',
          accentBg: 'bg-emerald-600',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          statBg: 'bg-emerald-50',
          statBorder: 'border-emerald-100',
          buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
          coverFrom: '#059669',
          coverTo: '#0d9488',
        };
      default:
        return {
          label: 'Citizen',
          gradient: 'from-blue-600 to-indigo-700',
          accentBg: 'bg-blue-600',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          statBg: 'bg-blue-50',
          statBorder: 'border-blue-100',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
          coverFrom: '#2563eb',
          coverTo: '#4338ca',
        };
    }
  };

  const roleConfig = getRoleConfig();
  const isEmailVerified = (user as any).verification?.email || (user as any).isEmailVerified || false;

  const getAvatarSrc = () => {
    if (!user.avatar) return null;
    if (user.avatar.startsWith('/upload/')) return `/api${user.avatar}`;
    return user.avatar;
  };

  const role = (user as any).role;

  const statsConfig = stats
    ? role === 'admin'
      ? [
          { value: stats.issuesReported, label: 'Total Issues', icon: '📋' },
          { value: stats.issuesResolved, label: 'Resolved', icon: '✅' },
          { value: stats.achievements ?? 0, label: 'Citizens', icon: '👥' },
        ]
      : role === 'volunteer'
      ? [
          { value: stats.issuesReported, label: 'Tasks Done', icon: '🎯' },
          { value: stats.issuesResolved, label: 'Claimed', icon: '📌' },
          { value: stats.communityScore, label: 'Points', icon: '⭐' },
        ]
      : [
          { value: stats.issuesReported, label: 'Reported', icon: '📋' },
          { value: stats.issuesResolved, label: 'Resolved', icon: '✅' },
          { value: stats.achievements ?? 0, label: 'Achievements', icon: '🏆' },
        ]
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Decorative top band */}
      <div
        className="h-24 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${roleConfig.coverFrom} 0%, ${roleConfig.coverTo} 100%)`,
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Soft bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      <div className="px-6 pb-6">
        {/* Avatar + name row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12">
          {/* Avatar */}
          <div className="relative w-24 h-24 shrink-0">
            <div
              className={`w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br ${roleConfig.gradient}`}
            >
              {getAvatarSrc() && !avatarError ? (
                <img
                  src={getAvatarSrc()!}
                  alt={getFullName()}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-3xl font-black">{getInitials()}</span>
                </div>
              )}
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-sm" />
          </div>

          {/* Edit button (top right on desktop) */}
          <div className="sm:pb-1">
            <button
              onClick={() => router.push('/profile/edit')}
              className={`flex items-center cursor-pointer gap-2 px-5 py-2.5 ${roleConfig.buttonBg} text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0`}
            >
              <PencilIcon className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Name + meta */}
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{getFullName()}</h1>
            {isEmailVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-50 border border-green-200 rounded-full text-xs font-bold text-green-700">
                <ShieldCheckIcon className="w-3 h-3" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 bg-red-50 border border-red-200 rounded-full text-xs font-bold text-red-600">
                ⚠ Unverified
              </span>
            )}
          </div>

          {/* Role badge */}
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${roleConfig.badgeBg} mb-3`}
          >
            {roleConfig.label}
          </span>

          {/* Bio */}
          {(user as any).bio && (
            <p className="text-sm text-gray-600 mb-3 max-w-2xl leading-relaxed">{(user as any).bio}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
              Joined {formatDate(user.createdAt || user.joinDate)}
            </span>
            {(user as any).phone && (
              <span className="flex items-center gap-1.5">
                <PhoneIcon className="w-3.5 h-3.5 shrink-0" />
                {(user as any).phone}
              </span>
            )}
            {user.address?.city && (
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
                {user.address.city}
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        {statsConfig && (
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
            {statsConfig.map((s) => (
              <div
                key={s.label}
                className={`${roleConfig.statBg} border ${roleConfig.statBorder} rounded-xl px-4 py-3.5 text-center`}
              >
                <div className="text-xl mb-0.5">{s.icon}</div>
                <div className="text-xl font-black text-gray-900">{s.value}</div>
                <div className="text-xs font-semibold text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;