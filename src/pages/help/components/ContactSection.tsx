import React from 'react';
import { PhoneIcon } from '@heroicons/react/24/outline';

const ContactSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>General Inquiry</option>
              <option>Technical Support</option>
              <option>Feature Request</option>
              <option>Report a Bug</option>
              <option>Partnership</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your issue or question in detail..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Send Message
          </button>
        </form>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Support Hours</h4>
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
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h4>
          <p className="text-gray-600 mb-4">
            For urgent community safety issues that require immediate attention.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <PhoneIcon className="w-5 h-5 text-red-600 mr-2" />
              <span className="font-semibold text-red-800">Emergency Hotline: 1-800-COMM-FIX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;