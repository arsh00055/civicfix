'use client'

import React, { useState } from 'react'
import { 
  UserGroupIcon, 
  MapPinIcon, 
  LifebuoyIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: UserGroupIcon,
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'Click on the "Create Account" button on the login page. Choose your role (Citizen, Volunteer, or Admin), fill in your details, verify your email, and you&apos;re ready to start using CivicFix!'
        },
        {
          question: 'What are the different user roles?',
          answer: 'We have three roles: Citizens can report issues and track progress, Volunteers can claim and resolve issues, and Admins manage platform operations and user accounts.'
        },
        {
          question: 'Is there a mobile app available?',
          answer: 'Currently, CivicFix is web-based and works great on mobile browsers. We&apos;re developing a dedicated mobile app that will be released soon.'
        }
      ]
    },
    {
      title: 'Reporting Issues',
      icon: MapPinIcon,
      questions: [
        {
          question: 'How do I report a community issue?',
          answer: 'Go to the "Report Issue" page, fill in the details including location, category, and description. You can add photos and pin the exact location on the map.'
        },
        {
          question: 'What types of issues can I report?',
          answer: 'You can report various issues including road problems, public safety concerns, sanitation issues, vandalism, infrastructure problems, and community service needs.'
        },
        {
          question: 'Can I report issues anonymously?',
          answer: 'Yes! When reporting an issue, you can choose to report anonymously. However, providing your details helps us follow up if needed.'
        }
      ]
    },
    {
      title: 'Volunteering',
      icon: LifebuoyIcon,
      questions: [
        {
          question: 'How do I become a volunteer?',
          answer: 'Register as a volunteer and complete your profile with your skills and availability. Once approved, you can start claiming and resolving issues in your community.'
        },
        {
          question: 'What skills do I need to volunteer?',
          answer: 'We welcome all skills! From gardening and cleaning to technical repairs and teaching. Every skill contributes to making our community better.'
        },
        {
          question: 'Do I get recognized for my volunteer work?',
          answer: 'Yes! Volunteers earn points, badges, and recognition for their contributions. Top volunteers are featured on our leaderboard.'
        }
      ]
    }
  ]

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="space-y-6">
      {faqCategories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <category.icon className="w-5 h-5 text-blue-600 mr-3" aria-hidden="true" />
              <h3 className="text-md font-semibold text-gray-900">{category.title}</h3>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {category.questions.map((faq, faqIndex) => {
              const index = categoryIndex * 10 + faqIndex
              return (
                <div key={faqIndex} className="px-6 py-4">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex items-center justify-between cursor-pointer w-full text-left "
                    aria-expanded={openFaq === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="text-[14px] font-medium text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div 
                      id={`faq-answer-${index}`}
                      className="mt-3 text-gray-600 bg-blue-50 rounded-lg p-4"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}