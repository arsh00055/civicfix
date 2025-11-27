import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import HelpHeader from './components/HelpHeader';
import SearchBar from './components/SearchBar';
import QuickActions from './components/QuickActions';
import HelpTabs from './components/HelpTabs';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';
import ResourcesSection from './components/ResourcesSection';
import SupportCTA from './components/SupportCTA';
import Sidebar from '../../components/layout/sidebar/Sidebar';
import Header from '../../components/layout/Header/Header';
import { useAppSelector } from '../../app/store/hooks';

interface HelpProps {
  role: string | null;
}

const HelpSupportPage: React.FC<HelpProps> = ({ role }) => {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'resources'>('faq');

  return (
    <MainLayout role="citizen">
      <div className="flex h-screen bg-gray-50">
        {/* Conditionally render Sidebar based on state */}
        {sidebarOpen && <Sidebar />}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={role} />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl mx-auto px-4 py-8">
            <HelpHeader />
            <SearchBar />
            <QuickActions />
            <HelpTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            {/* Tab Content */}
            {activeTab === 'faq' && <FAQSection />}
            {activeTab === 'contact' && <ContactSection />}
            {activeTab === 'resources' && <ResourcesSection />}
            
            <SupportCTA />
          </div>
          </main>
        </div>
      </div>
    </MainLayout>
  );
};

export default HelpSupportPage;