import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks';
import { toggleSidebar } from '../../../app/store/slices/uiSlice';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  userRole: string | null;
}

const Header: React.FC<HeaderProps> = ({ userRole }) => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  const handleMenuClick = () => {
    dispatch(toggleSidebar());
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4 ">
          <button
            onClick={handleMenuClick}
            className="p-2 rounded-md text-white cursor-pointer hover:bg-[#333]"
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-800 lg:ml-0">
            Hi 👋
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <NotificationBell />
          <UserMenu role={userRole}/>
        </div>
      </div>
    </header>
  );
};

export default Header;