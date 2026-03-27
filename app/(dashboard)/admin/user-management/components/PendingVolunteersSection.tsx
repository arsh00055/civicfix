'use client'

import { useState } from 'react'

interface PendingVolunteer {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  experienceLevel: string;
  phone?: string;
  bio?: string;
  createdAt: string;
}

interface PendingVolunteersSectionProps {
  pendingVolunteers: PendingVolunteer[];
  loading: boolean;
  onApprove: (volunteerId: string) => Promise<void>;
  onReject: (volunteerId: string) => Promise<void>;
}

export default function PendingVolunteersSection({
  pendingVolunteers,
  loading,
  onApprove,
  onReject
}: PendingVolunteersSectionProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Loading...</span>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-100 rounded"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (pendingVolunteers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">All Clear</span>
        </div>
        <p className="text-gray-500 text-sm">No pending volunteer applications.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
      <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 text-xl">⏳</span>
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Volunteer Approvals
            </h2>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-2">
              {pendingVolunteers.length} pending
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Review and approve/reject volunteer applications
          </p>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {pendingVolunteers.map((volunteer) => (
          <div key={volunteer._id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {volunteer.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {volunteer.email}
                  </span>
                  {volunteer.phone && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      📞 {volunteer.phone}
                    </span>
                  )}
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                  <span>Applied: {new Date(volunteer.createdAt).toLocaleDateString()}</span>
                  <span className="capitalize">Experience: {volunteer.experienceLevel}</span>
                </div>

                {/* Skills */}
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {volunteer.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bio - Collapsible */}
                {volunteer.bio && (
                  <div className="mt-2">
                    <button
                      onClick={() => setExpandedId(expandedId === volunteer._id ? null : volunteer._id)}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      {expandedId === volunteer._id ? '▼ Hide Bio' : '▶ Show Bio'}
                    </button>
                    {expandedId === volunteer._id && (
                      <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {volunteer.bio}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setProcessingId(volunteer._id);
                    onApprove(volunteer._id).finally(() => setProcessingId(null));
                  }}
                  disabled={processingId === volunteer._id}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  {processingId === volunteer._id ? 'Processing...' : '✓ Approve'}
                </button>
                <button
                  onClick={() => {
                    setProcessingId(volunteer._id);
                    onReject(volunteer._id).finally(() => setProcessingId(null));
                  }}
                  disabled={processingId === volunteer._id}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  {processingId === volunteer._id ? 'Processing...' : '✗ Reject'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}