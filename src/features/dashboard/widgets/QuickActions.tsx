import React from 'react';
import PrimaryButton from '../../../components/UI/buttons/PrimaryButton';
import SecondaryButton from '../../../components/UI/buttons/SecondaryButton';

interface QuickActionsProps {
  userRole: string | null;
}

const QuickActions: React.FC<QuickActionsProps> = ({ userRole }) => {

  const citizenActions = [
    { label: 'Report Issue', href: '/report', primary: true },
    { label: 'View Map', href: '/map', primary: false },
    { label: 'My Reports', href: '/my-issues', primary: false },
  ];

  const volunteerActions = [
    { label: 'Find Tasks', href: '/tasks', primary: true },
    { label: 'My Assignments', href: '/assignments', primary: false },
    { label: 'Update Skills', href: '/profile', primary: false },
  ];

  const adminActions = [
    { label: 'User Management', href: '/admin/users', primary: true },
    { label: 'System Settings', href: '/admin/settings', primary: false },
    { label: 'View Reports', href: '/admin/reports', primary: false },
  ];

  const getActions = () => {
    switch (userRole) {
      case 'citizen': return citizenActions;
      case 'volunteer': return volunteerActions;
      case 'admin': return adminActions;
      default: return [];
    }
  };

  const actions = getActions();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {actions.map((action, index) => (
          action.primary ? (
            <PrimaryButton
              key={index}
              onClick={() => window.location.href = action.href}
              className="w-full justify-center"
            >
              {action.label}
            </PrimaryButton>
          ) : (
            <SecondaryButton
              key={index}
              onClick={() => window.location.href = action.href}
              className="w-full justify-center"
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