'use client'

import React, { useState } from 'react'
import HelpHeader from './components/HelpHeader'
import SearchBar from './components/SearchBar'
import QuickActions from './components/QuickActions'
import HelpTabs from './components/HelpTabs'
import FAQSection from './components/FAQSection'
import ContactSection from './components/ContactSection'
import ResourcesSection from './components/ResourcesSection'
import SupportCTA from './components/SupportCTA'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function HelpSupportPage() {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'resources'>('faq');
  const router = useRouter();

  const handleTabChange = (tab: 'faq' | 'contact' | 'resources') => {
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/login')}
          className="flex items-center cursor-pointer self-start gap-2 text-gray-600 hover:text-gray-800 mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>
        <HelpHeader />
        <SearchBar />
        <QuickActions />
        <HelpTabs activeTab={activeTab} onTabChange={handleTabChange} />
        
        {activeTab === 'faq' && <FAQSection />}
        {activeTab === 'contact' && <ContactSection />}
        {activeTab === 'resources' && <ResourcesSection />}
        
        <SupportCTA />
      </div>
    </div>
  )
}