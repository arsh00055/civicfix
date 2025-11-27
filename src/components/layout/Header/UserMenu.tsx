import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { UserIcon } from '@heroicons/react/24/outline';

interface userMenuProps {
  role: string | null;
}

const UserMenu: React.FC<userMenuProps> = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { userRole, logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const [background, setBackground] = useState<string>("");

  useEffect(() => {
    renderBackground();
  })

  const renderBackground = () => {
    switch (role) {
      case 'citizen':
        return setBackground("bg-gradient-to-r from-blue-600 to-indigo-700");
      case 'volunteer':
        return setBackground("bg-gradient-to-r from-green-600 to-emerald-700");
      case 'admin':
        return setBackground("bg-gradient-to-r from-purple-600 to-indigo-700");
      default:
        return <div>Unknown user role</div>;
    }
  }

  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/images/avatar-placeholder.png"
  };

  return (
    <div className={`relative ${background} cursor-pointer rounded-md p-2 hover:bg-[#fff]`}ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 text-sm rounded-full cursor-pointer"
      >
        <UserIcon className='w-6 h-6 text-white' />
        <span className="hidden md:block text-white">{user.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 text-xs text-gray-500 border-b">
            Signed in as {userRole}
          </div>
          <a
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Your Profile
          </a>
          <button
            onClick={logout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;