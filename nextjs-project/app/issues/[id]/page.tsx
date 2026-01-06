'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import apiClient from '@/lib/services/api/client'
import type { Issue } from '@/types/issue.types'
import Loading from '@/app/loading'
import Error from '@/app/error'
import IssueTimeline from './components/IssueTimeline'
import CommentSection from './components/CommentSection'
import VoteButton from '@/components/issues/IssueActions/VoteButton'
import ClaimButton from '@/components/issues/IssueActions/ClaimButton'
import ShareButton from '@/components/issues/IssueActions/ShareButton'
import { 
  MapPinIcon, 
  CalendarIcon, 
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon
} from '@/components/UI/icons'
import { formatRelativeTime, formatDate } from '@/lib/utils/helpers/formatters'

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'timeline'>('details')

  useEffect(() => {
    if (id) {
      fetchIssue()
    }
  }, [id])

  const fetchIssue = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get(`/issues/${id}`)
      setIssue(response.data)
    } catch (err: any) {
      console.error('Failed to fetch issue:', err)
      setError(err.message || 'Failed to load issue details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'reported': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in_review': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return CheckCircleIcon
      case 'in_progress': return ClockIcon
      default: return ExclamationTriangleIcon
    }
  }

  const handleRetry = () => {
    fetchIssue()
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />)
  }

  if (!issue) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">Issue Not Found</h2>
          <p className="text-yellow-700 mb-6">The issue you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            Return to Issues
          </button>
        </div>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(issue.status)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded"
        >
          <ArrowLeftIcon className="w-5 h-5" aria-hidden="true" />
          <span>Back</span>
        </button>
        <div className="h-6 w-px bg-gray-300" aria-hidden="true"></div>
        <h1 className="text-2xl font-bold text-gray-900">Issue Details</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{issue.title}</h1>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(issue.status)}`}>
                <StatusIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                {issue.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getPriorityColor(issue.priority)}`}>
                <ExclamationTriangleIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                {issue.priority.toUpperCase()} PRIORITY
              </span>
              <span className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-sm font-medium">
                {issue.category.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <VoteButton issueId={issue.id} initialVotes={issue.upvotes || 0} />
            <ClaimButton issueId={issue.id} currentStatus={issue.status} />
            <ShareButton issueId={issue.id} />
          </div>
        </div>

        <p className="text-gray-700 text-lg mb-8 leading-relaxed">{issue.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <MapPinIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-gray-900">Location</p>
              <p className="text-sm text-gray-600 truncate">{issue.location}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-gray-900">Reported</p>
              <p className="text-sm text-gray-600">{formatRelativeTime(issue.createdAt)}</p>
              <p className="text-xs text-gray-500">{formatDate(issue.createdAt)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <UserIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-gray-900">Reporter</p>
              <p className="text-sm text-gray-600">{issue.reporter?.name || 'Anonymous'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <ClockIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-gray-900">Last Updated</p>
              <p className="text-sm text-gray-600">{formatRelativeTime(issue.updatedAt)}</p>
            </div>
          </div>
        </div>

        {issue.assignedTo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-5 h-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-blue-900">Assigned Volunteer</p>
                <p className="text-sm text-blue-700">
                  <strong>{issue.assignedTo.name}</strong> is working on this issue
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Issue detail tabs">
            {[
              { id: 'details' as const, label: 'Details', icon: ExclamationTriangleIcon },
              { id: 'comments' as const, label: 'Comments', icon: UserIcon },
              { id: 'timeline' as const, label: 'Timeline', icon: ClockIcon },
            ].map(tab => {
              const TabIcon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded-t ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  aria-selected={activeTab === tab.id}
                  role="tab"
                >
                  <TabIcon className="w-4 h-4" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Issue Description</h3>
                <div className="prose max-w-none text-gray-700">
                  <p className="whitespace-pre-line">{issue.description}</p>
                </div>
              </div>

              {issue.images && issue.images.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Attached Images</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {issue.images.map((image, index) => (
                      <div key={index} className="group relative">
                        <Image
                          src={image}
                          alt={`Issue evidence ${index + 1}`}
                          width={300}
                          height={192}
                          className="rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow w-full h-48 object-cover"
                          onClick={() => window.open(image, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" aria-hidden="true"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {issue.latitude && issue.longitude && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Location Coordinates</h4>
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span>Latitude: {issue.latitude}</span>
                    <span>Longitude: {issue.longitude}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <CommentSection 
              issueId={issue.id} 
              comments={issue.comments || []} 
            />
          )}

          {activeTab === 'timeline' && (
            <IssueTimeline issue={issue} />
          )}
        </div>
      </div>
    </div>
  )
}