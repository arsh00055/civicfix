'use client'

import { useState } from 'react'

interface PendingVolunteer {
  _id: string
  name: string
  email: string
  skills: string[]
  experienceLevel: string
  phone?: string
  bio?: string
  createdAt: string
  avatar?: string
  location?: string
}

interface Props {
  pendingVolunteers: PendingVolunteer[]
  loading: boolean
  onApprove: (id: string) => Promise<void>
  onReject: (id: string, reason: string) => Promise<void>
}

export default function PendingVolunteersSection({
  pendingVolunteers,
  loading,
  onApprove,
  onReject,
}: Props) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectModalId, setRejectModalId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      await onApprove(id)
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectModalId) return
    setProcessingId(rejectModalId)
    try {
      await onReject(rejectModalId, rejectReason)
      setRejectModalId(null)
      setRejectReason('')
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (pendingVolunteers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✅</span>
          <h2 className="text-lg font-semibold text-gray-800">Pending Volunteer Approvals</h2>
          <span className="ml-auto text-xs bg-green-100 text-center text-green-700 px-2 py-1 rounded-full font-medium">
            All clear
          </span>
        </div>
        <p className="text-sm text-gray-500">No pending volunteer applications.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-amber-200 shadow-sm mb-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-amber-100 bg-amber-50">
          <div className="flex items-center gap-3">
            <span className="text-xl">⏳</span>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Pending Volunteer Approvals</h2>
              <p className="text-xs text-gray-500 mt-0.5">Review and approve or reject applications</p>
            </div>
          </div>
          <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
            {pendingVolunteers.length} Pending
          </span>
        </div>

        {/* Volunteer Cards */}
        <div className="divide-y divide-gray-100">
          {pendingVolunteers.map((volunteer) => {
            const isProcessing = processingId === volunteer._id

            return (
              <div key={volunteer._id} className="p-4">
                
                {/* Avatar + Info Row */}
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {volunteer.avatar ? (
                      <img
                        src={volunteer.avatar}
                        alt={volunteer.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {volunteer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{volunteer.name}</span>
                      {volunteer.experienceLevel && (
                        <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full capitalize">
                          {volunteer.experienceLevel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{volunteer.email}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {volunteer.phone && (
                        <span className="text-xs text-gray-500">📞 {volunteer.phone}</span>
                      )}
                      {volunteer.location && (
                        <span className="text-xs text-gray-500">📍 {volunteer.location}</span>
                      )}
                      <span className="text-xs text-gray-400">
                        Applied: {formatDate(volunteer.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {volunteer.skills && volunteer.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {volunteer.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {volunteer.skills.length > 4 && (
                      <span className="text-xs text-gray-400 px-1">
                        +{volunteer.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons — apni row vich */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setRejectModalId(volunteer._id)}
                    disabled={isProcessing}
                    className="flex-1 text-xs font-medium cursor-pointer px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
                  >
                    ✕ Reject
                  </button>
                  <button
                    onClick={() => handleApprove(volunteer._id)}
                    disabled={isProcessing}
                    className="flex-1 text-xs font-medium cursor-pointer px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    {isProcessing ? (
                      <>
                        <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      '✓ Approve'
                    )}
                  </button>
                </div>

              </div>
            )
          })}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Reject Volunteer</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejection (optional)
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Skills do not match, incomplete profile..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setRejectModalId(null)
                  setRejectReason('')
                }}
                className="px-4 py-2 text-sm cursor-pointer text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={processingId === rejectModalId}
                className="px-4 py-2 text-sm cursor-pointer font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {processingId === rejectModalId ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Confirm Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}