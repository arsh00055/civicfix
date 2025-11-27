import React from 'react';
import type { UserProfile } from '../../../types';
import { 
  UserIcon, 
  MapIcon, 
  ShieldCheckIcon,
  CogIcon 
} from '../../../components/UI/icons';

interface ProfileSidebarProps {
  user: UserProfile;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user }) => {
  const menuItems = [
    { icon: UserIcon, label: 'Personal Info', href: '/profile' },
    { icon: MapIcon, label: 'Location Settings', href: '/profile/location' },
    { icon: ShieldCheckIcon, label: 'Privacy & Security', href: '/profile/privacy' },
    { icon: CogIcon, label: 'Preferences', href: '/profile/preferences' },
  ];

  const verificationItems = [
    { label: 'Email', verified: user.verification?.email, icon: '✉️' },
    { label: 'Phone', verified: user.verification?.phone, icon: '📱' },
    { label: 'Identity', verified: user.verification?.identity, icon: '🆔' },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Menu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
        <nav className="space-y-2">
          {menuItems.map(item => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </a>
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
                <button className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors">
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
            {user.skills.map(skill => (
              <span
                key={skill}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Availability (for volunteers) */}
      {user.role === 'volunteer' && user.availability && user.availability.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
          <div className="space-y-2">
            {user.availability.map(slot => (
              <div key={slot} className="flex items-center space-x-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{slot}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSidebar;