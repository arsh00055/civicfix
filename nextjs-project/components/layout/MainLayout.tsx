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
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && <Sidebar />}
      
      <div className="flex-1 flex flex-col transition-all duration-300">
        <Header userRole={role} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;