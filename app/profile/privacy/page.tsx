'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/features/auth/hooks/useAuth'
import apiClient from '@/lib/services/api/client'

const PrivacySecurityPage: React.FC = () => {
  const router = useRouter()
  const { user: currentUser } = useAuth()

  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showActivity: true,
    profileVisibility: 'public',
  })

  const [savingPrivacy, setSavingPrivacy] = useState(false)
  const [privacySuccess, setPrivacySuccess] = useState(false)
  const [privacyError, setPrivacyError] = useState<string | null>(null)

  const handlePrivacySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPrivacy(true)
    setPrivacyError(null)
    setPrivacySuccess(false)
    try {
      await apiClient.put('/users/privacy', privacy)
      setPrivacySuccess(true)
      setTimeout(() => setPrivacySuccess(false), 3000)
    } catch (err: any) {
      setPrivacyError(err?.response?.data?.message || 'Failed to save privacy settings.')
    } finally {
      setSavingPrivacy(false)
    }
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )

  return (
    <MainLayout role={currentUser?.role || null}>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">← Back</button>
          <h1 className="text-2xl font-bold text-gray-900">Privacy & Security</h1>
        </div>

        {/* Privacy Settings */}
        <form onSubmit={handlePrivacySubmit}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Privacy Settings</h2>
            <p className="text-sm text-gray-500 mb-5">Control what others can see on your profile.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                <div className="flex gap-3">
                  {['public', 'community', 'private'].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setPrivacy(p => ({ ...p, profileVisibility: v }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        privacy.profileVisibility === v
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {privacy.profileVisibility === 'public' && 'Anyone can view your profile.'}
                  {privacy.profileVisibility === 'community' && 'Only registered users can view your profile.'}
                  {privacy.profileVisibility === 'private' && 'Only you can view your profile.'}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-4">
                {[
                  { key: 'showEmail', label: 'Show Email Address', desc: 'Allow others to see your email on your profile' },
                  { key: 'showPhone', label: 'Show Phone Number', desc: 'Allow others to see your phone number' },
                  { key: 'showLocation', label: 'Show Location', desc: 'Display your city/area on your public profile' },
                  { key: 'showActivity', label: 'Show Activity', desc: 'Let others see your recent activity and contributions' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                    <Toggle
                      checked={privacy[key as keyof typeof privacy] as boolean}
                      onChange={() => setPrivacy(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {privacyError && <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{privacyError}</div>}
            {privacySuccess && <div className="mt-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">✓ Privacy settings saved!</div>}

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={savingPrivacy}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
              >
                {savingPrivacy ? 'Saving...' : 'Save Privacy Settings'}
              </button>
            </div>
          </div>
        </form>

        {/* Change Password — Button only, opens new page */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Password</h2>
          <p className="text-sm text-gray-500 mb-5">Update your password to keep your account secure.</p>
          <button
            type="button"
            onClick={() => router.push('/profile/change-password')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            Change Password →
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">These actions are irreversible. Proceed with caution.</p>
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                apiClient.delete('/users/account').then(() => router.push('/'))
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            Delete My Account
          </button>
        </div>
      </div>
    </MainLayout>
  )
}

export default PrivacySecurityPage
