'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import apiClient from '@/lib/services/api/client'
import type { Issue } from '@/types/issue.types'
import Loading from '@/app/loading'
import Error from '@/app/error'
import IssueTimeline from './components/IssueTimeline'
import CommentSection from './components/CommentSection'
import MainLayout from '@/components/layout/MainLayout'
import VoteButton from '@/components/issues/IssueActions/VoteButton'
import ClaimButton from '@/components/issues/IssueActions/ClaimButton'
import {
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
} from '@/components/UI/icons'
import { formatRelativeTime, formatDate } from '@/lib/utils/helpers/formatters'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { toast } from 'sonner'
import { XMarkIcon } from '@heroicons/react/24/solid'
import ResolutionRating from '@/components/issues/ResolutionRating'

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { user } = useAuth()
  const userRole = user?.role ?? null;

  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'timeline'>('details')
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchIssue()
  }, [id])

  const fetchIssue = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get(`/issues/${id}`)
      const issueData = response.data?.data ?? response.data
      setIssue(issueData)
    } catch (err: any) {
      console.error('Failed to fetch issue:', err)
      toast.error("Failed to load issue details. Please try again.")
      setError(err.message || 'Failed to load issue details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':       return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':    return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'assigned':       return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'reported':       return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pending_review': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'in_review':      return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default:               return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high':     return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':   return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':      return 'bg-green-100 text-green-800 border-green-200'
      default:         return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':    return CheckCircleIcon
      case 'in_progress': return ClockIcon
      default:            return ExclamationTriangleIcon
    }
  }

  if (loading) return <Loading />

  if (error) {
    return (
      <Error
        error={error as unknown as Error & { digest?: string }}
        reset={fetchIssue}
      />
    )
  }

  if (!issue) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-800 mb-2">Issue Not Found</h2>
          <p className="text-yellow-700 mb-6">
            The issue you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Return to Issues
          </button>
        </div>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(issue.status)

  return (
    <>
      <MainLayout role={userRole}>
        {/* FIX: px-3 on mobile, px-6 on sm+. overflow-x-hidden prevents horizontal scroll */}
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6 overflow-x-hidden w-full">

          {/* Back button */}
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <button
              onClick={() => router.back()}
              className="flex items-center cursor-pointer space-x-2 text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="h-6 w-px bg-gray-300 flex-shrink-0" />
            {/* FIX: text-lg on mobile, text-2xl on sm+ */}
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Issue Details</h1>
          </div>

          {/* Main card — overflow-hidden stops children from blowing out */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
              <div className="flex-1 min-w-0">
                {/* FIX: text-xl → sm:text-2xl → md:text-3xl */}
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 break-words">
                  {issue.title}
                </h1>
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                  <span className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(issue.status)}`}>
                    <StatusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    {issue.status.replaceAll('_', ' ').toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${getPriorityColor(issue.priority)}`}>
                    <ExclamationTriangleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    {issue.priority.toUpperCase()} PRIORITY
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-xs sm:text-sm font-medium">
                    {issue.category.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <VoteButton issueId={issue.id} initialVotes={issue.upvotes || 0} />
                <ClaimButton issueId={issue.id} currentStatus={issue.status} />
                {user?.id === issue.reporterId && issue.status === 'reported' && (
                  <button
                  onClick={() => router.push(`/issues/${issue.id}/edit?role=${userRole}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    ✏️ Edit
                    </button>
                  )}
              </div>
            </div>

            {/* FIX: text-base on mobile, text-lg on sm+ */}
            <p className="text-gray-700 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed break-words">
              {issue.description}
            </p>

            <ResolutionRating
              issueId={issue.id}
              issueStatus={issue.status}
              reporterId={issue.reporterId}
            />

            {/* FIX: Metadata grid — min-w-0 + overflow-hidden on each card so truncate works */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg min-w-0 overflow-hidden">
                <MapPinIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div className="min-w-0 overflow-hidden">
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600 truncate">{issue.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg min-w-0 overflow-hidden">
                <CalendarIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">Reported</p>
                  <p className="text-sm text-gray-600">{formatRelativeTime(issue.createdAt)}</p>
                  <p className="text-xs text-gray-500">{formatDate(issue.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg min-w-0 overflow-hidden">
                <UserIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">Reporter</p>
                  <p className="text-sm text-gray-600 truncate">{issue.reporter?.name || 'Anonymous'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg min-w-0 overflow-hidden">
                <ClockIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">Last Updated</p>
                  <p className="text-sm text-gray-600">{formatRelativeTime(issue.updatedAt)}</p>
                </div>
              </div>
            </div>

            {issue.assignedTo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-blue-900">Assigned Volunteer</p>
                    <p className="text-sm text-blue-700 break-words">
                      <strong>{issue.assignedTo.name}</strong> is working on this issue
                    </p>
                  </div>
                </div>
              </div>
            )}

            {issue.resolutionNotes && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-green-900 mb-2">Resolution Notes</h4>
                <p className="text-sm text-green-700 break-words">{issue.resolutionNotes}</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px overflow-x-auto" role="tablist">
                {[
                  { id: 'details'  as const, label: 'Details',  icon: ExclamationTriangleIcon },
                  { id: 'comments' as const, label: 'Comments', icon: UserIcon },
                  { id: 'timeline' as const, label: 'Timeline', icon: ClockIcon },
                ].map(tab => {
                  const TabIcon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      className={`flex items-center cursor-pointer space-x-2 py-4 px-4 sm:px-6 text-sm font-medium border-b-2 transition-colors focus:outline-none whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <TabIcon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* FIX: p-4 on mobile, p-6 on sm+. overflow-x-hidden stops coordinate overflow */}
            <div className="p-4 sm:p-6 overflow-x-hidden">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    {/* FIX: text-base → sm:text-xl */}
                    <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-4">Issue Description</h3>
                    <p className="text-gray-700 whitespace-pre-line break-words">{issue.description}</p>
                  </div>

                  {issue.images && issue.images.length > 0 && (
                    <div>
                      {/* FIX: text-sm → sm:text-lg */}
                      <h4 className="text-sm sm:text-lg font-medium text-gray-900 mb-4">Attached Images</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {issue.images.map((image, index) => (
                          <div key={index} className="group relative">
                            {imageErrors[index] ? (
                              <div className="w-full h-40 sm:h-48 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                                <span className="text-4xl text-gray-400">📷</span>
                              </div>
                            ) : (
                              <button onClick={() => setSelectedImage(image)} className="w-full focus:outline-none">
                                <img
                                  src={image}
                                  alt={`Issue evidence ${index + 1}`}
                                  className="w-full h-40 sm:h-48 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow object-cover"
                                  onError={() => handleImageError(index)}
                                />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {issue.resolutionProof && issue.resolutionProof.length > 0 && (
                    <div>
                      <h4 className="text-sm sm:text-lg font-medium text-gray-900 mb-4">Resolution Proof</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {issue.resolutionProof.map((image, index) => (
                          <div key={index} className="group relative">
                            <button onClick={() => setSelectedImage(image)} className="w-full focus:outline-none">
                              <img
                                src={image}
                                alt={`Resolution proof ${index + 1}`}
                                className="w-full h-40 sm:h-48 rounded-lg border border-green-200 cursor-pointer hover:shadow-md transition-shadow object-cover"
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {issue.latitude != null && issue.longitude != null && (
                    <div>
                      {/* FIX: text-sm → sm:text-lg */}
                      <h4 className="text-sm sm:text-lg font-medium text-gray-900 mb-3">Location Coordinates</h4>
                      {/* FIX: flex-col so coordinates wrap on mobile, break-all for long numbers */}
                      <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-600 break-all">
                        <p>Latitude: {issue.latitude}</p>
                        <p>Longitude: {issue.longitude}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'comments' && (
                <CommentSection issueId={issue.id} initialComments={issue.comments || []} />
              )}

              {activeTab === 'timeline' && (
                <IssueTimeline issue={issue} />
              )}
            </div>
          </div>
        </div>
      </MainLayout>
      <AnimatePresence>
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl max-h-[90vh]"
            >
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
