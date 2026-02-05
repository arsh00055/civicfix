'use client'

import React, { useState } from 'react'
import { PhoneIcon } from '@heroicons/react/24/outline'

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Get in Touch</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Report a Bug">Report a Bug</option>
              <option value="Partnership">Partnership</option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="Describe your issue or question in detail..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-medium"
          >
            Send Message
          </button>
        </form>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h4 className="text-[18px] font-semibold text-gray-900 mb-4">Support Hours</h4>
          <div className="space-y-3">
            {[
              { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
              { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
              { day: 'Sunday', hours: 'Emergency Support Only' }
            ].map((schedule, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <span className="text-gray-600">{schedule.day}</span>
                <span className="font-medium text-gray-900">{schedule.hours}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h4 className="text-[18px] font-semibold text-gray-900 mb-4">Emergency Contact</h4>
          <p className="text-gray-600 mb-4">
            For urgent community safety issues that require immediate attention.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <PhoneIcon className="w-5 h-5 text-red-600 mr-2" aria-hidden="true" />
              <span className="font-semibold text-red-800">Emergency Hotline: 1-800-COMM-FIX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}