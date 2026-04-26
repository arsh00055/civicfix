'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/services/api/client'
import { toast } from 'sonner'
import {
  Cog6ToothIcon,
  UserGroupIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

interface SystemSettings {
  siteName: string
  supportEmail: string
  maintenanceMode: boolean
  allowCitizenRegistration: boolean
  allowVolunteerRegistration: boolean
}

const defaultSettings: SystemSettings = {
  siteName: 'CivicFix',
  supportEmail: 'support@civicfix.com',
  maintenanceMode: false,
  allowCitizenRegistration: true,
  allowVolunteerRegistration: true,
}

type TabId = 'general' | 'users'

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: 'general', label: 'General',          icon: Cog6ToothIcon },
  { id: 'users',   label: 'User Registration', icon: UserGroupIcon },
]

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('general')

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/admin/settings')
      if (response.data?.success) {
        setSettings({ ...defaultSettings, ...response.data.data })
      }
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await apiClient.patch('/admin/settings', settings)
      toast.success('Settings saved successfully')
    } catch (err: any) {
      toast.error('Failed to save settings', {
        description: err.response?.data?.message || 'Please try again.'
      })
    } finally {
      setSaving(false)
    }
  }

  const update = (key: keyof SystemSettings, value: any) =>
    setSettings(prev => ({ ...prev, [key]: value }))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">System Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage platform configuration and preferences</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchSettings}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Maintenance Banner */}
        {settings.maintenanceMode && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-6 flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-yellow-600 font-semibold text-sm">⚠️ Maintenance Mode is ON</span>
            <span className="text-yellow-700 text-sm">Citizens and volunteers cannot log in right now.</span>
          </div>
        )}

        {/* Tabs + Panel — stack on mobile, side by side on sm+ */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">

          {/* Tab Sidebar — horizontal on mobile, vertical on sm+ */}
          <div className="sm:w-52 sm:shrink-0">
            <nav className="flex sm:flex-col gap-2 sm:gap-1 overflow-x-auto sm:overflow-visible">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-colors text-left whitespace-nowrap flex-shrink-0 sm:w-full ${
                      activeTab === tab.id
                        ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-200'
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Panel */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">

            {/* GENERAL */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-base font-semibold text-gray-800 border-b pb-2">General Settings</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={e => update('siteName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Shown in emails and browser title</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={e => update('supportEmail', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Users will see this in notification emails</p>
                </div>

                <ToggleRow
                  label="Maintenance Mode"
                  description="When ON, citizens and volunteers cannot log in. Admins are unaffected."
                  value={settings.maintenanceMode}
                  onChange={v => update('maintenanceMode', v)}
                  danger
                />
              </div>
            )}

            {/* USER REGISTRATION */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <h2 className="text-base font-semibold text-gray-800 border-b pb-2">User Registration</h2>

                <ToggleRow
                  label="Allow Citizen Registration"
                  description="When OFF, new citizens cannot create an account"
                  value={settings.allowCitizenRegistration}
                  onChange={v => update('allowCitizenRegistration', v)}
                />

                <ToggleRow
                  label="Allow Volunteer Registration"
                  description="When OFF, new volunteers cannot apply to join"
                  value={settings.allowVolunteerRegistration}
                  onChange={v => update('allowVolunteerRegistration', v)}
                />
              </div>
            )}

            {/* Save bottom */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  label, description, value, onChange, danger = false,
}: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
  danger?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className={`text-sm font-medium ${danger ? 'text-red-700' : 'text-gray-800'}`}>{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 mt-0.5 ${
          value
            ? danger ? 'bg-red-500 focus:ring-red-500' : 'bg-purple-600 focus:ring-purple-500'
            : 'bg-gray-300 focus:ring-gray-400'
        }`}
        role="switch"
        aria-checked={value}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}