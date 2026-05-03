'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/features/auth/hooks/useAuth'
import apiClient from '@/lib/services/api/client'

const LocationSettingsPage: React.FC = () => {
  const router = useRouter()
  const { user: currentUser } = useAuth()

  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null)

  useEffect(() => {
    if (currentUser) {
      const addr = (currentUser as any).address || {}
      setFormData({
        street: typeof addr === 'string' ? addr : addr.street || '',
        city: (currentUser as any).city || addr.city || '',
        state: (currentUser as any).state || addr.state || '',
        zipCode: (currentUser as any).zipCode || addr.zipCode || '',
        country: (currentUser as any).country || addr.country || '',
      })
    }
  }, [currentUser])

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          const addr = data.address || {}
          setFormData(prev => ({
            ...prev,
            city: addr.city || addr.town || addr.village || prev.city,
            state: addr.state || prev.state,
            zipCode: addr.postcode || prev.zipCode,
            country: addr.country || prev.country,
          }))
          setDetectedLocation(`${addr.city || addr.town || ''}, ${addr.state || ''}, ${addr.country || ''}`)
        } catch {
          setError('Could not fetch address from location.')
        } finally {
          setDetecting(false)
        }
      },
      () => {
        setError('Permission denied or location unavailable.')
        setDetecting(false)
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await apiClient.put('/users/location', formData)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save location settings.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MainLayout role={currentUser?.role || null}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-500 cursor-pointer hover:text-gray-700">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Location Settings</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Auto-detect */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Auto-Detect Location</h2>
            <p className="text-sm text-gray-500 mb-4">
              Allow the browser to detect your current location automatically.
            </p>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detecting}
              className="px-4 py-2 bg-blue-50 text-blue-700 cursor-pointer border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50"
            >
              {detecting ? '📍 Detecting...' : '📍 Detect My Location'}
            </button>
            {detectedLocation && (
              <p className="mt-2 text-sm text-green-600">✓ Detected: {detectedLocation}</p>
            )}
          </div>

          {/* Address Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Address Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={e => setFormData(p => ({ ...p, street: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Your city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={e => setFormData(p => ({ ...p, zipCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="110001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={e => setFormData(p => ({ ...p, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="India"
                />
              </div>
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm">✓ Location settings saved successfully!</div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 cursor-pointer text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white cursor-pointer rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {saving ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default LocationSettingsPage
