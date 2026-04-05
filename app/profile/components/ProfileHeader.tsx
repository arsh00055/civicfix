// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import type { UserProfile } from '@/types';
// import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
// import { formatDate } from '@/lib/utils/helpers/formatters';

// interface ProfileHeaderProps {
//   user: UserProfile;
//   stats?: {
//     issuesReported: number;
//     issuesResolved: number;
//     communityScore: number;
//   };
// }

// const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, stats }) => {
//   const router = useRouter();
//   const [avatarError, setAvatarError] = useState(false);

//   // 👇 ROLE-BASED COLORS
//   const getRoleColors = (role: string) => {
//     switch (role) {
//       case 'admin':
//         return {
//           badge: 'bg-purple-100 text-purple-800 border-purple-200',
//           cover: 'from-purple-600 to-indigo-700',
//           avatarBg: 'from-purple-500 to-indigo-600',
//           button: 'bg-purple-600 hover:bg-purple-700'
//         };
//       case 'volunteer':
//         return {
//           badge: 'bg-green-100 text-green-800 border-green-200',
//           cover: 'from-green-600 to-emerald-700',
//           avatarBg: 'from-green-500 to-emerald-600',
//           button: 'bg-green-600 hover:bg-green-700'
//         };
//       case 'citizen':
//         return {
//           badge: 'bg-blue-100 text-blue-800 border-blue-200',
//           cover: 'from-blue-600 to-indigo-700',
//           avatarBg: 'from-blue-500 to-indigo-600',
//           button: 'bg-blue-600 hover:bg-blue-700'
//         };
//       default:
//         return {
//           badge: 'bg-gray-100 text-gray-800 border-gray-200',
//           cover: 'from-gray-600 to-gray-700',
//           avatarBg: 'from-gray-500 to-gray-600',
//           button: 'bg-gray-600 hover:bg-gray-700'
//         };
//     }
//   };

//   const getRoleDisplayName = (role: string) => {
//     switch (role) {
//       case 'admin': return 'Administrator';
//       case 'volunteer': return 'Volunteer';
//       case 'citizen': return 'Community Citizen';
//       default: return 'User';
//     }
//   };

//   const getFullName = () => {
//     if (user.firstName || user.lastName) {
//       return `${user.firstName || ''} ${user.lastName || ''}`.trim();
//     }
//     return user.name || 'User';
//   };

//   const getInitials = () => {
//     const fullName = getFullName();
//     return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
//   };

//   const roleColors = getRoleColors(user.role);

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//       {/* 👇 ROLE-BASED COVER IMAGE */}
//       <div className={`h-32 bg-gradient-to-r ${roleColors.cover}`}></div>

//       <div className="px-6 pb-6">
//         <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
//           <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
//             <div className="relative">
//                 {user.avatar && !avatarError ? (
//                   <img
//                     src={user.avatar}
//                     alt={getFullName()}
//                     className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
//                     onError={() => setAvatarError(true)}
//                   />
//                 ) : (
//                 <div className={`w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br ${roleColors.avatarBg} flex items-center justify-center`}>
//                   <span className="text-white text-3xl font-bold">{getInitials()}</span>
//                 </div>
//               )}
//               {user.verification?.identity && (
//                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
//                   <span className="text-white text-xs">✓</span>
//                 </div>
//               )}
//             </div>
            
//             <div className="space-y-2">
//               <div className="flex items-center space-x-3 flex-wrap gap-2">
//                 <h1 className="text-2xl font-bold text-gray-900">{getFullName()}</h1>
//                 {/* 👇 ROLE-BASED BADGE */}
//                 {user.isEmailVerified ? (
//   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
//     ✓ Verified
//   </span>
// ) : (
//   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
//     ⚠ Unverified
//   </span>
// )}
//               </div>
              
//               <p className="text-gray-600">{user.email}</p>
              
//               {user.bio && (
//                 <p className="text-gray-700 max-w-2xl">{user.bio}</p>
//               )}
              
//               <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
//                 <span>Joined {formatDate(user.joinDate)}</span>
//                 {user.phone && <span>• 📞 {user.phone}</span>}
//                 {user.address && <span>• 📍 {user.address.street}, {user.address.city}</span>}
//               </div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
//             <PrimaryButton
//               onClick={() => router.push('/profile/edit')}
//               className={`${roleColors.button} text-white`}
//             >
//               Edit Profile
//             </PrimaryButton>
//           </div>
//         </div>

//         {/* Stats */}
//         {stats && (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
//             <div className="text-center">
//               <div className="text-3xl font-bold text-gray-900">{stats.issuesReported}</div>
//               <div className="text-sm text-gray-600">Issues Reported</div>
//             </div>
//             <div className="text-center">
//               <div className="text-3xl font-bold text-gray-900">{stats.issuesResolved}</div>
//               <div className="text-sm text-gray-600">Issues Resolved</div>
//             </div>
//             <div className="text-center">
//               <div className="text-3xl font-bold text-gray-900">{stats.communityScore}%</div>
//               <div className="text-sm text-gray-600">Community Score</div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProfileHeader;


'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/types';
import { formatDate } from '@/lib/utils/helpers/formatters';
import { PencilIcon, MapPinIcon, PhoneIcon, CalendarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

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
    switch (user.role) {
      case 'admin': return { label: 'Administrator', gradient: 'from-purple-600 to-indigo-600', light: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'volunteer': return { label: 'Volunteer', gradient: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default: return { label: 'Community Citizen', gradient: 'from-blue-600 to-indigo-600', light: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
  };

  const roleConfig = getRoleConfig();
  const isEmailVerified = (user as any).verification?.email || (user as any).isEmailVerified || false;

  const getAvatarSrc = () => {
    if (!user.avatar) return null;
    if (user.avatar.startsWith('/upload/')) return `/api${user.avatar}`;
    return user.avatar;
  };

  const statsConfig = stats ? (
    user.role === 'admin' ? [
      { value: stats.issuesReported, label: 'Total Issues', icon: '📋' },
      { value: stats.issuesResolved, label: 'Resolved', icon: '✅' },
      { value: stats.achievements ?? 0, label: 'Citizens', icon: '👥' },
    ] : user.role === 'volunteer' ? [
      { value: stats.issuesReported, label: 'Tasks Done', icon: '🎯' },
      { value: stats.issuesResolved, label: 'Claimed', icon: '📌' },
      { value: `${stats.communityScore}`, label: 'Points', icon: '⭐' },
    ] : [
      { value: stats.issuesReported, label: 'Reported', icon: '📋' },
      { value: stats.issuesResolved, label: 'Resolved', icon: '✅' },
      { value: `${stats.communityScore}%`, label: 'Score', icon: '⭐' },
    ]
  ) : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Top gradient bar */}
      <div className={`h-1.5 bg-gradient-to-r ${roleConfig.gradient}`} />

      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-5">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className={`w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br ${roleConfig.gradient} shadow-lg`}>
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
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">{getFullName()}</h1>
                  {isEmailVerified ? (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-50 border border-green-200 rounded-full text-xs font-bold text-green-700">
                      <ShieldCheckIcon className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-red-50 border border-red-200 rounded-full text-xs font-bold text-red-600">
                      ⚠ Unverified
                    </span>
                  )}
                </div>

                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${roleConfig.light} mb-3`}>
                  {roleConfig.label}
                </span>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    Joined {formatDate(user.joinDate)}
                  </span>
                  {(user as any).phone && (
                    <span className="flex items-center gap-1">
                      <PhoneIcon className="w-3.5 h-3.5" />
                      {(user as any).phone}
                    </span>
                  )}
                  {user.address?.city && (
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-3.5 h-3.5" />
                      {user.address.city}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => router.push('/profile/edit')}
                className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${roleConfig.gradient} text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95`}
              >
                <PencilIcon className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {statsConfig && (
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
            {statsConfig.map((s) => (
              <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="text-lg mb-0.5">{s.icon}</div>
                <div className="text-xl font-black text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;