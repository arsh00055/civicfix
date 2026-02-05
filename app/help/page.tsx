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

export default function HelpSupportPage() {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'resources'>('faq')

  const handleTabChange = (tab: 'faq' | 'contact' | 'resources') => {
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
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