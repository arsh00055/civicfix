// 'use client';

// import React from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import type { UserProfile } from '@/types';
// import {
//   UserIcon,
//   MapIcon,
//   ShieldCheckIcon,
//   CogIcon,
//   TrophyIcon,
//   BellIcon,
//   ChartBarIcon,
// } from '@/components/UI/icons';

// interface ProfileSidebarProps {
//   user: UserProfile;
//   onVerificationSuccess?: (type: 'email' | 'phone' | 'identity') => void;
// }

// const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user }) => {
//   const router = useRouter();
//   const pathname = usePathname();

//   const menuItems = [
//     { icon: UserIcon, label: 'Profile Overview', href: '/profile' },
//     { icon: CogIcon, label: 'Edit Profile', href: '/profile/edit' },
//     { icon: TrophyIcon, label: 'Achievements', href: '/profile/achievements' },
//     { icon: MapIcon, label: 'Location Settings', href: '/profile/location' },
//     { icon: ShieldCheckIcon, label: 'Privacy & Security', href: '/profile/privacy' },
//     { icon: BellIcon, label: 'Notifications', href: '/notifications' },
//     { icon: ChartBarIcon, label: 'Statistics', href: '/profile/stats' },
//   ];

//   const isEmailVerified = (user as any).isEmailVerified || false;

//   return (
//     <div className="space-y-6">
//       {/* Navigation Menu */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
//         <nav className="space-y-1">
//           {menuItems.map((item) => {
//             const isActive = pathname === item.href;
//             return (
//               <button
//                 key={item.href}
//                 onClick={() => router.push(item.href)}
//                 className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${
//                   isActive
//                     ? 'bg-blue-50 text-blue-700 font-medium'
//                     : 'text-gray-700 hover:bg-gray-50'
//                 }`}
//               >
//                 <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
//                 <span className="text-sm">{item.label}</span>
//               </button>
//             );
//           })}
//         </nav>

//         {/* ✅ Email verified badge - menu ਦੇ ਹੇਠਾਂ */}
//         <div className="mt-4 pt-4 border-t border-gray-100">
//           <div className="flex items-center gap-2">
//             <span className="text-sm">✉️</span>
//             <span className="text-xs text-gray-500 truncate">{(user as any).email}</span>
//             {isEmailVerified ? (
//               <span className="ml-auto text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full shrink-0">
//                 ✓ Verified
//               </span>
//             ) : (
//               <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full shrink-0">
//                 ⚠ Unverified
//               </span>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Skills (volunteers only) */}
//       {user.role === 'volunteer' && user.skills && user.skills.length > 0 && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h3>
//           <div className="flex flex-wrap gap-2">
//             {user.skills.slice(0, 5).map((skill) => (
//               <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
//                 {skill}
//               </span>
//             ))}
//             {user.skills.length > 5 && (
//               <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
//                 +{user.skills.length - 5} more
//               </span>
//             )}
//           </div>
//           <button
//             onClick={() => router.push('/profile/edit')}
//             className="mt-3 text-sm text-blue-600 hover:text-blue-700"
//           >
//             Edit Skills
//           </button>
//         </div>
//       )}

//       {/* Availability (volunteers only) */}
//       {user.role === 'volunteer' && Array.isArray(user.availability) && user.availability.length > 0 && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
//           <div className="space-y-2">
//             {user.availability.slice(0, 3).map((slot: any, idx: number) => (
//               <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
//                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                 <span>
//                   {Array.isArray(slot.days) ? slot.days.join(', ') : ''}{' '}
//                   {slot.hours ? `(${slot.hours.start} - ${slot.hours.end})` : ''}{' '}
//                   {slot.timezone || ''}
//                 </span>
//               </div>
//             ))}
//             {user.availability.length > 3 && (
//               <div className="text-sm text-gray-500">+{user.availability.length - 3} more time slots</div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProfileSidebar;


'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile } from '@/types';
import {
  UserIcon, MapIcon, ShieldCheckIcon, CogIcon,
  TrophyIcon, BellIcon, ChartBarIcon,
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

  const isEmailVerified = (user as any).verification?.email || (user as any).isEmailVerified || false;

  const getRoleConfig = () => {
    switch ((user as any).role) {
      case 'admin': return { gradient: 'from-purple-500 to-indigo-600', active: 'bg-purple-600 text-white', dot: 'bg-purple-500' };
      case 'volunteer': return { gradient: 'from-emerald-500 to-teal-600', active: 'bg-emerald-600 text-white', dot: 'bg-emerald-500' };
      default: return { gradient: 'from-blue-500 to-indigo-600', active: 'bg-blue-600 text-white', dot: 'bg-blue-500' };
    }
  };

  const roleConfig = getRoleConfig();

  return (
    <div className="space-y-4">
      {/* Nav Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${roleConfig.gradient}`} />

        {/* Email Badge */}
        <div className="px-4 py-3 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-sm">✉️</span>
            <span className="text-xs text-gray-400 truncate flex-1">{(user as any).email}</span>
            {isEmailVerified ? (
              <span className="shrink-0 text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">✓</span>
            ) : (
              <span className="shrink-0 text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">⚠</span>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="p-2 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? `${roleConfig.active} shadow-sm`
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {isActive && (
                  <div className={`w-1.5 h-1.5 rounded-full ${roleConfig.dot} opacity-0`} />
                )}
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Skills (volunteers only) */}
      {(user as any).role === 'volunteer' && user.skills && user.skills.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Skills</h3>
            <button onClick={() => router.push('/profile/edit')} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              Edit
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.skills.slice(0, 6).map(skill => (
              <span key={skill} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100">
                {skill}
              </span>
            ))}
            {user.skills.length > 6 && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-lg">
                +{user.skills.length - 6}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Availability (volunteers only) */}
      {(user as any).role === 'volunteer' && Array.isArray(user.availability) && user.availability.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Availability</h3>
          <div className="space-y-2">
            {user.availability.slice(0, 3).map((slot: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-2 h-2 bg-emerald-400 rounded-full shrink-0" />
                <span>
                  {Array.isArray(slot.days) ? slot.days.join(', ') : ''}
                  {slot.hours ? ` (${slot.hours.start} - ${slot.hours.end})` : ''}
                </span>
              </div>
            ))}
            {user.availability.length > 3 && (
              <p className="text-xs text-gray-400">+{user.availability.length - 3} more</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSidebar;