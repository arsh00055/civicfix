'use client';

import React from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import Header from './Header/Header';
import Sidebar from './sidebar/Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  role: string | null;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, role }) => {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Container */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30
          h-screen w-64
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${!sidebarOpen ? 'lg:w-0' : 'lg:w-64'}
        `}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className={`
        flex-1 min-h-screen w-full
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
      `}>
        <Header role={role} />

        <main className="h-[calc(100vh-4rem)] overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;