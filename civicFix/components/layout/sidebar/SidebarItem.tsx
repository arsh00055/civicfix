'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: string | null;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  href, 
  badge, 
  onClick 
}) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group
        ${isActive 
          ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' 
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }
      `}
    >
      <Icon className={`
        h-5 w-5 mr-3 flex-shrink-0 transition-colors
        ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
      `} />
      
      <span className="flex-1 truncate">{label}</span>
      
      {badge && (
        <span className={`
          inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full min-w-5
          ${isActive 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-gray-200 text-gray-800 group-hover:bg-gray-300'
          }
        `}>
          {badge}
        </span>
      )}
    </Link>
  );
};

export default SidebarItem;