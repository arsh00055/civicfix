'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import SecondaryButton from '@/components/UI/buttons/SecondaryButton';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface QuickActionsProps {
  userRole?: string | null;
}

const QuickActions: React.FC<QuickActionsProps> = ({ userRole: propUserRole }) => {
  const router = useRouter();
  const { user } = useAuth();
  const actualUserRole = propUserRole || user?.role;

  const citizenActions = [
    { label: 'Report Issue', href: '/issues/new', primary: true },
    { label: 'View Map', href: '/map', primary: false },
    { label: 'My Reports', href: '/issues/my-reports', primary: false },
  ];

  const volunteerActions = [
    { label: 'Find Tasks', href: '/tasks/find', primary: true },
    { label: 'My Assignments', href: '/tasks/assignments', primary: false },
    { label: 'Update Skills', href: '/profile/edit', primary: false },
    { label: 'Leaderboard', href: '/leaderboard' },
  ];

  const adminActions = [
    { label: 'User Management', href: '/admin/user-management', primary: true },
    { label: 'Analytics', href: '/admin/analytics', primary: false },
    { label: 'View Reports', href: '/admin/reports', primary: false },
  ];

  const getActions = () => {
    switch (actualUserRole) {
      case 'citizen': return citizenActions;
      case 'volunteer': return volunteerActions;
      case 'admin': return adminActions;
      default: return [];
    }
  };

  const actions = getActions();

  const handleActionClick = (href: string) => {
    router.push(href);
  };

  if (!actualUserRole || actions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {actions.map((action, index) => (
          action.primary ? (
            <PrimaryButton
            key={index}
            onClick={() => handleActionClick(action.href)}
            className="w-full cursor-pointer justify-center"
            role={actualUserRole as 'citizen' | 'volunteer' | 'admin'}
          >
            {action.label}
          </PrimaryButton>
          ) : (
            <SecondaryButton
              key={index}
              onClick={() => handleActionClick(action.href)}
              className="w-full cursor-pointer justify-center"
            >
              {action.label}
            </SecondaryButton>
          )
        ))}
      </div>
    </div>
  );
};

export default QuickActions;