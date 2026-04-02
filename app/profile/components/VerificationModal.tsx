'use client'

import React, { useState } from 'react'
import apiClient from '@/lib/services/api/client'

interface VerificationModalProps {
  type: 'email' | 'phone' | 'identity'
  onClose: () => void
  onSuccess: (type: 'email' | 'phone' | 'identity') => void
  userEmail?: string
  userPhone?: string
  phoneVerified?: boolean
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  type,
  onClose,
  onSuccess,
  userEmail,
  userPhone,
  phoneVerified,
}) => {
  const [step, setStep] = useState<'input' | 'otp'>('input')
  const [phone, setPhone] = useState(userPhone || '')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [devOtp, setDevOtp] = useState<string | null>(null)

  const config = {
    email: {
      title: '✉️ Verify Email',
      color: 'blue',
      icon: '📧',
      sendLabel: 'Send OTP to Email',
      description: `We'll send a 6-digit OTP to ${userEmail}`,
    },
    phone: {
      title: '📱 Verify Phone',
      color: 'green',
      icon: '📱',
      sendLabel: 'Send OTP via SMS',
      description: 'Enter your phone number to receive an OTP',
    },
    identity: {
      title: '🆔 Verify Identity',
      color: 'purple',
      icon: '🆔',
      sendLabel: 'Send OTP to Verified Phone',
      description: phoneVerified
        ? `We'll send an OTP to your verified phone (${userPhone?.slice(0, 4)}****)`
        : '⚠️ You must verify your phone number first before verifying identity.',
    },
  }

  const cfg = config[type]
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
  }
  const btnColor = colorMap[cfg.color]

  const handleSendOtp = async () => {
    setError('')
    setLoading(true)
    try {
      let res: any
      if (type === 'email') {
        res = await apiClient.post('/verify/email')
      } else if (type === 'phone') {
        if (!phone.trim()) { setError('Phone number is required'); setLoading(false); return }
        res = await apiClient.post('/verify/phone', { phone })
      } else {
        res = await apiClient.post('/verify/identity')
      }
      const data = res.data
      if (data.devOtp) setDevOtp(data.devOtp)
      setStep('otp')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) { setError('Enter the 6-digit OTP'); return }
    setError('')
    setLoading(true)
    try {
      const endpoint =
        type === 'email' ? '/verify/email-otp'
        : type === 'phone' ? '/verify/phone-otp'
        : '/verify/identity-otp'
      await apiClient.post(endpoint, { otp, phone })
      onSuccess(type)
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isBlocked = type === 'identity' && !phoneVerified

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{cfg.icon}</div>
          <h2 className="text-xl font-bold text-gray-900">{cfg.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{cfg.description}</p>
        </div>

        {isBlocked ? (
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-yellow-800 text-sm">
              ⚠️ Please verify your <strong>Phone Number</strong> first before proceeding with Identity verification.
            </div>
            <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Close
            </button>
          </div>
        ) : step === 'input' ? (
          <div className="space-y-4">
            {type === 'phone' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-black text-center text-lg tracking-wider"
                  placeholder="+91 98765 43210"
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold transition-colors ${btnColor} disabled:opacity-50`}
            >
              {loading ? 'Sending...' : cfg.sendLabel}
            </button>

            <button onClick={onClose} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600">
              Enter the 6-digit OTP sent to{' '}
              <strong>{type === 'email' ? userEmail : phone}</strong>
            </p>

            {/* Dev OTP hint */}
            {devOtp && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-center text-sm text-yellow-800">
                🧑‍💻 Dev Mode OTP: <strong className="text-lg tracking-widest">{devOtp}</strong>
              </div>
            )}

            {/* OTP Input */}
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-center text-3xl tracking-[0.5em] font-bold text-gray-900"
              placeholder="------"
              disabled={loading}
            />

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className={`w-full py-3 rounded-xl text-white font-semibold transition-colors ${btnColor} disabled:opacity-50`}
            >
              {loading ? 'Verifying...' : 'Verify OTP ✓'}
            </button>

            <button
              onClick={() => { setStep('input'); setOtp(''); setError(''); setDevOtp(null) }}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              ← Resend OTP
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerificationModal
