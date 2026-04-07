'use client'

import React, { useState } from 'react'
import HelpHeader from './components/HelpHeader'
import FAQSection from './components/FAQSection'
import ContactSection from './components/ContactSection'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function HelpSupportPage() {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq')
  const router = useRouter()
  const { user } = useAuth()

  return (
    <MainLayout role={user?.role ?? null}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center cursor-pointer gap-2 text-gray-600 hover:text-gray-800 mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>

        <HelpHeader />

        {/* Simple Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'faq', label: 'FAQ' },
              { id: 'contact', label: 'Contact Us' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'faq' | 'contact')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'faq' && <FAQSection />}
        {activeTab === 'contact' && <ContactSection />}

        {/* Support CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 mb-5 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Our support team is here to help you with any questions or issues.
          </p>
          <button
            onClick={() => setActiveTab('contact')}
            className="bg-white text-blue-600 py-3 px-8 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors font-medium"
          >
            Contact Support
          </button>
        </div>
      </div>
    </MainLayout>
  )
}
