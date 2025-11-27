import React from 'react';
import { useAppSelector } from '../../app/store/hooks';
import Header from './Header/Header';
import Sidebar from './sidebar/Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  role: string | null;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, role }) => {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conditionally render Sidebar based on state */}
      {sidebarOpen && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole={role} />
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;