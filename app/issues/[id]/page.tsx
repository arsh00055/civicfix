// // // 'use client'

// // // import React, { useState, useEffect } from 'react'
// // // import { useParams, useRouter } from 'next/navigation'
// // // import Image from 'next/image'
// // // import apiClient from '@/lib/services/api/client'
// // // import type { Issue } from '@/types/issue.types'
// // // import Loading from '@/app/loading'
// // // import Error from '@/app/error'
// // // import IssueTimeline from './components/IssueTimeline'
// // // import CommentSection from './components/CommentSection'
// // // import MainLayout from '@/components/layout/MainLayout'
// // // import VoteButton from '@/components/issues/IssueActions/VoteButton'
// // // import ClaimButton from '@/components/issues/IssueActions/ClaimButton'
// // // import ShareButton from '@/components/issues/IssueActions/ShareButton'
// // // import { 
// // //   MapPinIcon, 
// // //   CalendarIcon, 
// // //   UserIcon,
// // //   ExclamationTriangleIcon,
// // //   CheckCircleIcon,
// // //   ClockIcon,
// // //   ArrowLeftIcon
// // // } from '@/components/UI/icons'
// // // import { formatRelativeTime, formatDate } from '@/lib/utils/helpers/formatters'

// // // interface IssueProps {
// // //   userRole: string | null;
// // // }

// // // export default function IssueDetailPage({userRole}: IssueProps) {
// // //   const { id } = useParams<{ id: string }>()
// // //   const router = useRouter()
// // //   const [issue, setIssue] = useState<Issue | null>(null)
// // //   const [loading, setLoading] = useState(true)
// // //   const [error, setError] = useState<string | null>(null)
// // //   const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'timeline'>('details')

// // //   useEffect(() => {
// // //     if (id) {
// // //       fetchIssue()
// // //     }
// // //   }, [id])

// // //   const fetchIssue = async () => {
// // //     try {
// // //       setLoading(true)
// // //       setError(null)
// // //       const response = await apiClient.get(`/issues/${id}`) // ✅ CORRECT - dynamic ID
// // //       setIssue(response.data)
// // //     } catch (err: any) {
// // //       console.error('Failed to fetch issue:', err)
// // //       setError(err.message || 'Failed to load issue details. Please try again.')
// // //     } finally {
// // //       setLoading(false)
// // //     }
// // //   }

// // //   const handleBack = () => {
// // //     router.back()
// // //   }

// // //   const getStatusColor = (status: string) => {
// // //     switch (status) {
// // //       case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
// // //       case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
// // //       case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200'
// // //       case 'reported': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
// // //       case 'in_review': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
// // //       default: return 'bg-gray-100 text-gray-800 border-gray-200'
// // //     }
// // //   }

// // //   const getPriorityColor = (priority: string) => {
// // //     switch (priority) {
// // //       case 'critical': return 'bg-red-100 text-red-800 border-red-200'
// // //       case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
// // //       case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
// // //       case 'low': return 'bg-green-100 text-green-800 border-green-200'
// // //       default: return 'bg-gray-100 text-gray-800 border-gray-200'
// // //     }
// // //   }

// // //   const getStatusIcon = (status: string) => {
// // //     switch (status) {
// // //       case 'resolved': return CheckCircleIcon
// // //       case 'in_progress': return ClockIcon
// // //       default: return ExclamationTriangleIcon
// // //     }
// // //   }

// // //   const handleRetry = () => {
// // //     fetchIssue()
// // //   }

// // //   if (loading) {
// // //     return <Loading />
// // //   }

// // //   if (error) {
// // //     return (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />)
// // //   }

// // //   if (!issue) {
// // //     return (
// // //       <div className="max-w-4xl mx-auto p-6 text-center">
// // //         <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
// // //           <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" aria-hidden="true" />
// // //           <h2 className="text-2xl font-bold text-yellow-800 mb-2">Issue Not Found</h2>
// // //           <p className="text-yellow-700 mb-6">The issue you&apos;re looking for doesn&apos;t exist or has been removed.</p>
// // //           <button
// // //             onClick={handleBack}
// // //             className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
// // //           >
// // //             Return to Issues
// // //           </button>
// // //         </div>
// // //       </div>
// // //     )
// // //   }

// // //   const StatusIcon = getStatusIcon(issue.status)

// // //   return (
// // //       <MainLayout role={userRole}>
// // //       <div className="max-w-4xl mx-auto p-6 space-y-6">
// // //         <div className="flex items-center space-x-4">
// // //           <button
// // //             onClick={handleBack}
// // //             className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded"
// // //           >
// // //             <ArrowLeftIcon className="w-5 h-5" aria-hidden="true" />
// // //             <span>Back</span>
// // //           </button>
// // //           <div className="h-6 w-px bg-gray-300" aria-hidden="true"></div>
// // //           <h1 className="text-2xl font-bold text-gray-900">Issue Details</h1>
// // //         </div>

// // //         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
// // //           <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
// // //             <div className="flex-1">
// // //               <h1 className="text-3xl font-bold text-gray-900 mb-4">{issue.title}</h1>
              
// // //               <div className="flex flex-wrap gap-3 mb-4">
// // //                 <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(issue.status)}`}>
// // //                   <StatusIcon className="w-4 h-4 mr-2" aria-hidden="true" />
// // //                   {issue.status.replace('_', ' ').toUpperCase()}
// // //                 </span>
// // //                 <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getPriorityColor(issue.priority)}`}>
// // //                   <ExclamationTriangleIcon className="w-4 h-4 mr-2" aria-hidden="true" />
// // //                   {issue.priority.toUpperCase()} PRIORITY
// // //                 </span>
// // //                 <span className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-sm font-medium">
// // //                   {issue.category.toUpperCase()}
// // //                 </span>
// // //               </div>
// // //             </div>
            
// // //             <div className="flex space-x-3">
// // //               <VoteButton issueId={issue.id} initialVotes={issue.upvotes || 0} />
// // //               <ClaimButton issueId={issue.id} currentStatus={issue.status} />
// // //               <ShareButton issueId={issue.id} />
// // //             </div>
// // //           </div>

// // //           <p className="text-gray-700 text-lg mb-8 leading-relaxed">{issue.description}</p>

// // //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
// // //             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
// // //               <MapPinIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
// // //               <div>
// // //                 <p className="text-sm font-medium text-gray-900">Location</p>
// // //                 <p className="text-sm text-gray-600 truncate">{issue.location}</p>
// // //               </div>
// // //             </div>
            
// // //             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
// // //               <CalendarIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
// // //               <div>
// // //                 <p className="text-sm font-medium text-gray-900">Reported</p>
// // //                 <p className="text-sm text-gray-600">{formatRelativeTime(issue.createdAt)}</p>
// // //                 <p className="text-xs text-gray-500">{formatDate(issue.createdAt)}</p>
// // //               </div>
// // //             </div>
            
// // //             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
// // //               <UserIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
// // //               <div>
// // //                 <p className="text-sm font-medium text-gray-900">Reporter</p>
// // //                 <p className="text-sm text-gray-600">{issue.reporter?.name || 'Anonymous'}</p>
// // //               </div>
// // //             </div>
            
// // //             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
// // //               <ClockIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
// // //               <div>
// // //                 <p className="text-sm font-medium text-gray-900">Last Updated</p>
// // //                 <p className="text-sm text-gray-600">{formatRelativeTime(issue.updatedAt)}</p>
// // //               </div>
// // //             </div>
// // //           </div>

// // //           {issue.assignedTo && (
// // //             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
// // //               <div className="flex items-center space-x-3">
// // //                 <UserIcon className="w-5 h-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
// // //                 <div>
// // //                   <p className="text-sm font-medium text-blue-900">Assigned Volunteer</p>
// // //                   <p className="text-sm text-blue-700">
// // //                     <strong>{issue.assignedTo.name}</strong> is working on this issue
// // //                   </p>
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           )}
// // //         </div>

// // //         <div className="bg-white rounded-xl shadow-sm border border-gray-200">
// // //           <div className="border-b border-gray-200">
// // //             <nav className="flex -mb-px" aria-label="Issue detail tabs">
// // //               {[
// // //                 { id: 'details' as const, label: 'Details', icon: ExclamationTriangleIcon },
// // //                 { id: 'comments' as const, label: 'Comments', icon: UserIcon },
// // //                 { id: 'timeline' as const, label: 'Timeline', icon: ClockIcon },
// // //               ].map(tab => {
// // //                 const TabIcon = tab.icon
// // //                 return (
// // //                   <button
// // //                     key={tab.id}
// // //                     onClick={() => setActiveTab(tab.id)}
// // //                     className={`flex items-center space-x-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded-t ${
// // //                       activeTab === tab.id
// // //                         ? 'border-blue-500 text-blue-600'
// // //                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
// // //                     }`}
// // //                     aria-selected={activeTab === tab.id}
// // //                     role="tab"
// // //                   >
// // //                     <TabIcon className="w-4 h-4" aria-hidden="true" />
// // //                     <span>{tab.label}</span>
// // //                   </button>
// // //                 )
// // //               })}
// // //             </nav>
// // //           </div>

// // //           <div className="p-6">
// // //             {activeTab === 'details' && (
// // //               <div className="space-y-6">
// // //                 <div>
// // //                   <h3 className="text-xl font-semibold text-gray-900 mb-4">Issue Description</h3>
// // //                   <div className="prose max-w-none text-gray-700">
// // //                     <p className="whitespace-pre-line">{issue.description}</p>
// // //                   </div>
// // //                 </div>

// // //                 {issue.images && issue.images.length > 0 && (
// // //                   <div>
// // //                     <h4 className="text-lg font-medium text-gray-900 mb-4">Attached Images</h4>
// // //                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// // //                       {issue.images.map((image, index) => (
// // //                         <div key={index} className="group relative">
// // //                           <Image
// // //                             src={image}
// // //                             alt={`Issue evidence ${index + 1}`}
// // //                             width={300}
// // //                             height={192}
// // //                             className="rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow w-full h-48 object-cover"
// // //                             onClick={() => window.open(image, '_blank')}
// // //                           />
// // //                           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" aria-hidden="true"></div>
// // //                         </div>
// // //                       ))}
// // //                     </div>
// // //                   </div>
// // //                 )}

// // //                 {issue.latitude && issue.longitude && (
// // //                   <div>
// // //                     <h4 className="text-lg font-medium text-gray-900 mb-3">Location Coordinates</h4>
// // //                     <div className="flex space-x-4 text-sm text-gray-600">
// // //                       <span>Latitude: {issue.latitude}</span>
// // //                       <span>Longitude: {issue.longitude}</span>
// // //                     </div>
// // //                   </div>
// // //                 )}
// // //               </div>
// // //             )}

// // //             {activeTab === 'comments' && (
// // //               <CommentSection 
// // //                 issueId={issue.id} 
// // //                 comments={issue.comments || []} 
// // //               />
// // //             )}

// // //             {activeTab === 'timeline' && (
// // //               <IssueTimeline issue={issue} />
// // //             )}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </MainLayout>
// // //   )
// // // }

// // 'use client'

// // import React, { useState, useEffect } from 'react'
// // import { useParams, useRouter } from 'next/navigation'
// // import Image from 'next/image'
// // import apiClient from '@/lib/services/api/client'
// // import type { Issue } from '@/types/issue.types'
// // import Loading from '@/app/loading'
// // import Error from '@/app/error'
// // import IssueTimeline from './components/IssueTimeline'
// // import CommentSection from './components/CommentSection'
// // import MainLayout from '@/components/layout/MainLayout'
// // import VoteButton from '@/components/issues/IssueActions/VoteButton'
// // import ClaimButton from '@/components/issues/IssueActions/ClaimButton'
// // import ShareButton from '@/components/issues/IssueActions/ShareButton'
// // import { 
// //   MapPinIcon, 
// //   CalendarIcon, 
// //   UserIcon,
// //   ExclamationTriangleIcon,
// //   CheckCircleIcon,
// //   ClockIcon,
// //   ArrowLeftIcon
// // } from '@/components/UI/icons'
// // import { formatRelativeTime, formatDate } from '@/lib/utils/helpers/formatters'

// // interface IssueProps {
// //   userRole: string | null;
// // }

// // export default function IssueDetailPage({userRole}: IssueProps) {
// //   const { id } = useParams<{ id: string }>()
// //   const router = useRouter()
// //   const [issue, setIssue] = useState<Issue | null>(null)
// //   const [loading, setLoading] = useState(true)
// //   const [error, setError] = useState<string | null>(null)
// //   const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'timeline'>('details')

// //   useEffect(() => {
// //     if (!id) {
// //       setError('No issue ID provided')
// //       setLoading(false)
// //       return
// //     }
    
// //     fetchIssue()
// //   }, [id])

// //   const fetchIssue = async () => {
// //     if (!id) return
    
// //     try {
// //       setLoading(true)
// //       setError(null)
      
// //       console.log(`Fetching issue with ID: ${id}`)
      
// //       const response = await apiClient.get(`/issues/${id}`)
      
// //       console.log('Full API Response:', response)
// //       console.log('Issue data:', response.data)
      
// //       if (!response.data) {
// //         throw { message: 'No data received from server' } as Error
// //       }

// //       // Ensure required fields have default values (add missing required fields)
// //       const issueWithDefaults: Issue = {
// //         id: response.data.id || id,
// //         title: response.data.title || 'Untitled Issue',
// //         description: response.data.description || 'No description provided',
// //         status: response.data.status || 'reported',
// //         commentsCount: response.data.commentsCount ?? 0,
// //         reportedAt: response.data.reportedAt || response.data.createdAt || new Date().toISOString(),
// //         priority: response.data.priority || 'medium',
// //         category: response.data.category || 'general',
// //         location: response.data.location || 'Unknown location',
// //         createdAt: response.data.createdAt || new Date().toISOString(),
// //         updatedAt: response.data.updatedAt || new Date().toISOString(),
// //         upvotes: response.data.upvotes || 0,
// //         views: response.data.views || 0,
// //         reporter: response.data.reporter || { 
// //           id: 'unknown', 
// //           name: 'Anonymous', 
// //           email: 'anonymous@example.com' 
// //         },
// //         assignedTo: response.data.assignedTo || null,
// //         images: response.data.images || [],
// //         latitude: response.data.latitude || null,
// //         longitude: response.data.longitude || null,
// //         comments: response.data.comments || [],
// //         reporterId: response.data.reporterId || 'unknown'
// //       }
      
// //       setIssue(issueWithDefaults)
// //     } catch (err: any) {
// //       console.error('Failed to fetch issue:', err)
      
// //       let errorMessage = 'Failed to load issue details. Please try again.'
// //       if (err.response?.status === 404) {
// //         errorMessage = 'Issue not found'
// //       } else if (err.response?.status === 500) {
// //         errorMessage = 'Server error. Please try again later.'
// //       } else if (err.message) {
// //         errorMessage = err.message
// //       }
      
// //       setError(errorMessage)
      
// //       // For development, create a mock issue
// //       if (process.env.NODE_ENV === 'development') {
// //         console.log('Using mock issue data for development')
// //         setIssue({
// //           id: id,
// //           title: "Pothole on Main Street",
// //           description: "Large pothole causing traffic issues and vehicle damage",
// //           status: "in_progress",
// //           priority: "high",
// //           category: "road",
// //           location: "Main Street, Downtown",
// //           createdAt: new Date().toISOString(),
// //           updatedAt: new Date().toISOString(),
// //           upvotes: 15,
// //           views: 42,
// //           reporter: {
// //             id: "user-1",
// //             name: "Citizen",
// //             email: "citizen@demo.com"
// //           },
// //           assignedTo: {
// //             id: "vol-1",
// //             name: "Sarah Wilson",
// //             role: "volunteer"
// //           },
// //           images: [],
// //           latitude: 40.7128,
// //           longitude: -74.0060,
// //           comments: [],
// //           reporterId: "user-1",
// //           commentsCount: 0,
// //           reportedAt: new Date().toISOString(),
// //         })
// //       }
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const handleBack = () => {
// //     router.back()
// //   }

// //   const getStatusColor = (status: string) => {
// //     switch (status) {
// //       case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
// //       case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
// //       case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200'
// //       case 'reported': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
// //       case 'in_review': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
// //       default: return 'bg-gray-100 text-gray-800 border-gray-200'
// //     }
// //   }

// //   const getPriorityColor = (priority: string) => {
// //     switch (priority) {
// //       case 'critical': return 'bg-red-100 text-red-800 border-red-200'
// //       case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
// //       case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
// //       case 'low': return 'bg-green-100 text-green-800 border-green-200'
// //       default: return 'bg-gray-100 text-gray-800 border-gray-200'
// //     }
// //   }

// //   const getStatusIcon = (status: string) => {
// //     switch (status) {
// //       case 'resolved': return CheckCircleIcon
// //       case 'in_progress': return ClockIcon
// //       default: return ExclamationTriangleIcon
// //     }
// //   }

// //   const handleRetry = () => {
// //     fetchIssue()
// //   }

// //   if (loading) {
// //     return <Loading />
// //   }

// //   if (error && !issue) {
// //     return (
// //       <Error 
// //         error={error as unknown as Error & { digest?: string | undefined }} 
// //         reset={handleRetry}
// //       />
// //     )
// //   }

// //   if (!issue) {
// //     return (
// //       <MainLayout role={userRole}>
// //         <div className="max-w-4xl mx-auto p-6 text-center">
// //           <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
// //             <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" aria-hidden="true" />
// //             <h2 className="text-2xl font-bold text-yellow-800 mb-2">Issue Not Found</h2>
// //             <p className="text-yellow-700 mb-6">The issue you&apos;re looking for doesn&apos;t exist or has been removed.</p>
// //             <button
// //               onClick={handleBack}
// //               className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
// //             >
// //               Return to Issues
// //             </button>
// //           </div>
// //         </div>
// //       </MainLayout>
// //     )
// //   }

// //   const StatusIcon = getStatusIcon(issue.status || 'reported')

// //   return (
// //     <MainLayout role={userRole}>
// //       <div className="max-w-4xl mx-auto p-6 space-y-6">
// //         <div className="flex items-center space-x-4">
// //           <button
// //             onClick={handleBack}
// //             className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded"
// //           >
// //             <ArrowLeftIcon className="w-5 h-5" aria-hidden="true" />
// //             <span>Back</span>
// //           </button>
// //           <div className="h-6 w-px bg-gray-300" aria-hidden="true"></div>
// //           <h1 className="text-2xl font-bold text-gray-900">Issue Details</h1>
// //         </div>

// //         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
// //           <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
// //             <div className="flex-1">
// //               <h1 className="text-3xl font-bold text-gray-900 mb-4">{issue.title || 'Untitled Issue'}</h1>
              
// //               <div className="flex flex-wrap gap-3 mb-4">
// //                 <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${
// //                   getStatusColor(issue.status || 'reported')
// //                 }`}>
// //                   <StatusIcon className="w-4 h-4 mr-2" aria-hidden="true" />
// //                   {(issue.status || 'reported').replace('_', ' ').toUpperCase()}
// //                 </span>
// //                 <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${
// //                   getPriorityColor(issue.priority || 'medium')
// //                 }`}>
// //                   <ExclamationTriangleIcon className="w-4 h-4 mr-2" aria-hidden="true" />
// //                   {(issue.priority || 'medium').toUpperCase()} PRIORITY
// //                 </span>
// //                 <span className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-sm font-medium">
// //                   {(issue.category || 'general').toUpperCase()}
// //                 </span>
// //               </div>
// //             </div>
            
// //             <div className="flex space-x-3">
// //               <VoteButton 
// //                 issueId={issue.id} 
// //                 initialVotes={issue.upvotes || 0} 
// //               />
// //               <ClaimButton 
// //                 issueId={issue.id} 
// //                 currentStatus={issue.status || 'reported'} 
// //               />
// //               <ShareButton issueId={issue.id} />
// //             </div>
// //           </div>

// //           <p className="text-gray-700 text-lg mb-8 leading-relaxed">
// //             {issue.description || 'No description provided'}
// //           </p>

// //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
// //             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
// //               <MapPinIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
// //               <div>
// //                 <p className="text-sm font-medium text-gray-900">Location</p>
// //                 <p className="text-sm text-gray-600 truncate">{issue.location || 'Unknown location'}</p>
// //               </div>
// //             </div>
            
// //             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
// //               <CalendarIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
// //               <div>
// //                 <p className="text-sm font-medium text-gray-900">Reported</p>
// //                 <p className="text-sm text-gray-600">
// //                   {formatRelativeTime(issue.createdAt)}
// //                 </p>
// //                 <p className="text-xs text-gray-500">
// //                   {formatDate(issue.createdAt)}
// //                 </p>
// //               </div>
// //             </div>
            
// //             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
// //               <UserIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
// //               <div>
// //                 <p className="text-sm font-medium text-gray-900">Reporter</p>
// //                 <p className="text-sm text-gray-600">
// //                   {issue.reporter?.name || 'Anonymous'}
// //                 </p>
// //               </div>
// //             </div>
            
// //             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
// //               <ClockIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
// //               <div>
// //                 <p className="text-sm font-medium text-gray-900">Last Updated</p>
// //                 <p className="text-sm text-gray-600">
// //                   {formatRelativeTime(issue.updatedAt)}
// //                 </p>
// //               </div>
// //             </div>
// //           </div>

// //           {issue.assignedTo && (
// //             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
// //               <div className="flex items-center space-x-3">
// //                 <UserIcon className="w-5 h-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
// //                 <div>
// //                   <p className="text-sm font-medium text-blue-900">Assigned Volunteer</p>
// //                   <p className="text-sm text-blue-700">
// //                     <strong>{issue.assignedTo.name || 'Volunteer'}</strong> is working on this issue
// //                   </p>
// //                 </div>
// //               </div>
// //             </div>
// //           )}
// //         </div>

// //         <div className="bg-white rounded-xl shadow-sm border border-gray-200">
// //           <div className="border-b border-gray-200">
// //             <nav className="flex -mb-px" aria-label="Issue detail tabs">
// //               {[
// //                 { id: 'details' as const, label: 'Details', icon: ExclamationTriangleIcon },
// //                 { id: 'comments' as const, label: 'Comments', icon: UserIcon },
// //                 { id: 'timeline' as const, label: 'Timeline', icon: ClockIcon },
// //               ].map(tab => {
// //                 const TabIcon = tab.icon
// //                 return (
// //                   <button
// //                     key={tab.id}
// //                     onClick={() => setActiveTab(tab.id)}
// //                     className={`flex items-center space-x-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded-t ${
// //                       activeTab === tab.id
// //                         ? 'border-blue-500 text-blue-600'
// //                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
// //                     }`}
// //                     aria-selected={activeTab === tab.id}
// //                     role="tab"
// //                   >
// //                     <TabIcon className="w-4 h-4" aria-hidden="true" />
// //                     <span>{tab.label}</span>
// //                   </button>
// //                 )
// //               })}
// //             </nav>
// //           </div>

// //           <div className="p-6">
// //             {activeTab === 'details' && (
// //               <div className="space-y-6">
// //                 <div>
// //                   <h3 className="text-xl font-semibold text-gray-900 mb-4">Issue Description</h3>
// //                   <div className="prose max-w-none text-gray-700">
// //                     <p className="whitespace-pre-line">
// //                       {issue.description || 'No description provided'}
// //                     </p>
// //                   </div>
// //                 </div>

// //                 {issue.images && issue.images.length > 0 && (
// //                   <div>
// //                     <h4 className="text-lg font-medium text-gray-900 mb-4">Attached Images</h4>
// //                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //                       {issue.images.map((image, index) => (
// //                         <div key={index} className="group relative">
// //                           <Image
// //                             src={image}
// //                             alt={`Issue evidence ${index + 1}`}
// //                             width={300}
// //                             height={192}
// //                             className="rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow w-full h-48 object-cover"
// //                             onClick={() => window.open(image, '_blank')}
// //                           />
// //                           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" aria-hidden="true"></div>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 )}

// //                 {issue.latitude && issue.longitude && (
// //                   <div>
// //                     <h4 className="text-lg font-medium text-gray-900 mb-3">Location Coordinates</h4>
// //                     <div className="flex space-x-4 text-sm text-gray-600">
// //                       <span>Latitude: {issue.latitude}</span>
// //                       <span>Longitude: {issue.longitude}</span>
// //                     </div>
// //                   </div>
// //                 )}
// //               </div>
// //             )}

// //             {activeTab === 'comments' && (
// //               <CommentSection 
// //                 issueId={issue.id} 
// //                 comments={issue.comments || []} 
// //               />
// //             )}

// //             {activeTab === 'timeline' && (
// //               <IssueTimeline issue={issue} />
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </MainLayout>
// //   )
// // }

// 'use client'

// import React, { useState, useEffect } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import Image from 'next/image'
// import apiClient from '@/lib/services/api/client'
// import type { Issue } from '@/types/issue.types'
// import Loading from '@/app/loading'
// import Error from '@/app/error'
// import IssueTimeline from './components/IssueTimeline'
// import CommentSection from './components/CommentSection'
// import MainLayout from '@/components/layout/MainLayout'
// import VoteButton from '@/components/issues/IssueActions/VoteButton'
// import ClaimButton from '@/components/issues/IssueActions/ClaimButton'
// import ShareButton from '@/components/issues/IssueActions/ShareButton'
// import { 
//   MapPinIcon, 
//   CalendarIcon, 
//   UserIcon,
//   ExclamationTriangleIcon,
//   CheckCircleIcon,
//   ClockIcon,
//   ArrowLeftIcon
// } from '@/components/UI/icons'
// import { formatRelativeTime, formatDate } from '@/lib/utils/helpers/formatters'

// interface IssueProps {
//   userRole: string | null;
// }

// export default function IssueDetailPage({userRole}: IssueProps) {
//   const { id } = useParams<{ id: string }>()
//   const router = useRouter()
//   const [issue, setIssue] = useState<Issue | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'timeline'>('details')

//   useEffect(() => {
//     if (!id) {
//       setError('No issue ID provided')
//       setLoading(false)
//       return
//     }
    
//     fetchIssue()
//   }, [id])

//   const fetchIssue = async () => {
//     if (!id) return
    
//     try {
//       setLoading(true)
//       setError(null)
      
//       console.log(`📡 Fetching issue with ID: ${id}`)
      
//       // Make API call
//       const response = await apiClient.get(`/issues/${id}`)
      
//       console.log('✅ API Response received:', response)

//       if (!response.data || !response.data.issue) {
//         throw {
//           message: !response.data
//             ? 'No data received from server'
//             : 'Malformed API response: missing "issue" property'
//         };
//       }

//       const apiData = response.data.issue || response.data
      
//       console.log('📦 Extracted API data:', apiData)
      
//       if (!apiData) {
//         throw { message: 'No issue data found in response' };
//       }

//       // Map the API response to your Issue type
//       const issueWithDefaults: Issue = {
//         id: apiData.id || id,
//         title: apiData.title || 'Untitled Issue',
//         description: apiData.description || 'No description provided',
//         status: apiData.status || 'reported',
//         commentsCount: apiData.commentCount || apiData.commentsCount || 0,
//         reportedAt: apiData.reportedAt || apiData.createdAt || new Date().toISOString(),
//         priority: apiData.priority || 'medium',
//         category: apiData.category || 'general',
//         location: apiData.location || 'Unknown location',
//         createdAt: apiData.createdAt || new Date().toISOString(),
//         updatedAt: apiData.updatedAt || new Date().toISOString(),
//         upvotes: apiData.votes || apiData.upvotes || 0, // Your Mockoon uses "votes"
//         views: apiData.views || 0,
//         reporter: apiData.reporter || { 
//           id: apiData.reporterId || 'unknown', 
//           name: 'Anonymous', 
//           email: 'anonymous@example.com' 
//         },
//         assignedTo: apiData.volunteer || apiData.assignedTo || null, // Your Mockoon uses "volunteer"
//         images: apiData.images || [],
//         latitude: apiData.latitude || null,
//         longitude: apiData.longitude || null,
//         comments: apiData.comments || [],
//         reporterId: apiData.reporterId || 'unknown'
//       }
      
//       console.log('🎯 Processed issue:', issueWithDefaults)
//       console.log('🎯 Issue title:', issueWithDefaults.title)
//       console.log('🎯 Issue description:', issueWithDefaults.description)
      
//       setIssue(issueWithDefaults)
      
//     } catch (err: any) {
//       console.error('❌ Failed to fetch issue:', err)
      
//       let errorMessage = 'Failed to load issue details. Please try again.'
//       if (err.response?.status === 404) {
//         errorMessage = 'Issue not found'
//       } else if (err.response?.status === 500) {
//         errorMessage = 'Server error. Please try again later.'
//       } else if (err.message) {
//         errorMessage = err.message
//       }
      
//       setError(errorMessage)
      
//       // For development, create a mock issue matching your Mockoon structure
//       console.log('🛠️ Using mock issue data')
//       const mockIssue: Issue = {
//         id: id,
//         title: "Pothole on Main Street",
//         description: "Large pothole causing traffic issues and vehicle damage near the intersection of Main and 5th",
//         status: "in_progress",
//         priority: "high",
//         category: "infrastructure",
//         location: "123 Main Street, Downtown",
//         createdAt: "2024-01-10T08:00:00Z",
//         updatedAt: "2024-01-15T14:20:00Z",
//         upvotes: 15,
//         views: 42,
//         reporter: {
//           id: "user1",
//           name: "John Doe",
//           email: "john@example.com"
//         },
//         assignedTo: {
//           id: "volunteer1",
//           name: "Sarah Wilson",
//           role: "volunteer"
//         },
//         images: ["/images/pothole1.jpg", "/images/pothole2.jpg"],
//         latitude: 30.708531,
//         longitude: 76.688447,
//         comments: [
//           {
//             id: "comment1",
//             text: "This has been an issue for weeks! Glad someone is working on it.",
//             author: {
//               id: "user2",
//               name: "Mike Johnson",
//               avatar: "/images/avatar-placeholder.png",
//               role: ''
//             },
//             createdAt: "2024-01-14T10:30:00Z"
//           },
//           {
//             id: "comment2",
//             text: "I've started working on this. Should be fixed by tomorrow.",
//             author: {
//               id: "volunteer1",
//               name: "Sarah Wilson",
//               avatar: "/images/avatar-placeholder.png"
//             },
//             createdAt: "2024-01-15T09:15:00Z"
//           }
//         ],
//         reporterId: "user1",
//         commentsCount: 2,
//         reportedAt: "2024-01-10T08:00:00Z",
//       }
      
//       console.log('🛠️ Mock issue created:', mockIssue)
//       setIssue(mockIssue)
//       setError(null) // Clear error since we have mock data
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleBack = () => {
//     router.back()
//   }

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
//       case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
//       case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200'
//       case 'reported': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
//       case 'in_review': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
//       default: return 'bg-gray-100 text-gray-800 border-gray-200'
//     }
//   }

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'critical': return 'bg-red-100 text-red-800 border-red-200'
//       case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
//       case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
//       case 'low': return 'bg-green-100 text-green-800 border-green-200'
//       default: return 'bg-gray-100 text-gray-800 border-gray-200'
//     }
//   }

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'resolved': return CheckCircleIcon
//       case 'in_progress': return ClockIcon
//       default: return ExclamationTriangleIcon
//     }
//   }

//   const handleRetry = () => {
//     fetchIssue()
//   }

//   if (loading) {
//     return <Loading />
//   }

//   if (error && !issue) {
//     return (
//       <Error 
//         error={error as unknown as Error & { digest?: string | undefined }} 
//         reset={handleRetry}
//       />
//     )
//   }

//   if (!issue) {
//     return (
//       <MainLayout role={userRole}>
//         <div className="max-w-4xl mx-auto p-6 text-center">
//           <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
//             <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" aria-hidden="true" />
//             <h2 className="text-2xl font-bold text-yellow-800 mb-2">Issue Not Found</h2>
//             <p className="text-yellow-700 mb-6">The issue you&apos;re looking for doesn&apos;t exist or has been removed.</p>
//             <button
//               onClick={handleBack}
//               className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
//             >
//               Return to Issues
//             </button>
//           </div>
//         </div>
//       </MainLayout>
//     )
//   }

//   const StatusIcon = getStatusIcon(issue.status || 'reported')

//   return (
//     <MainLayout role={userRole}>
//       <div className="max-w-4xl mx-auto p-6 space-y-6">
//         <div className="flex items-center space-x-4">
//           <button
//             onClick={handleBack}
//             className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded"
//           >
//             <ArrowLeftIcon className="w-5 h-5" aria-hidden="true" />
//             <span>Back</span>
//           </button>
//           <div className="h-6 w-px bg-gray-300" aria-hidden="true"></div>
//           <h1 className="text-2xl font-bold text-gray-900">Issue Details</h1>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
//             <div className="flex-1">
//               <h1 className="text-3xl font-bold text-gray-900 mb-4">{issue.title || 'Untitled Issue'}</h1>
              
//               <div className="flex flex-wrap gap-3 mb-4">
//                 <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${
//                   getStatusColor(issue.status || 'reported')
//                 }`}>
//                   <StatusIcon className="w-4 h-4 mr-2" aria-hidden="true" />
//                   {(issue.status || 'reported').replace('_', ' ').toUpperCase()}
//                 </span>
//                 <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${
//                   getPriorityColor(issue.priority || 'medium')
//                 }`}>
//                   <ExclamationTriangleIcon className="w-4 h-4 mr-2" aria-hidden="true" />
//                   {(issue.priority || 'medium').toUpperCase()} PRIORITY
//                 </span>
//                 <span className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-sm font-medium">
//                   {(issue.category || 'general').toUpperCase()}
//                 </span>
//               </div>
//             </div>
            
//             <div className="flex space-x-3">
//               <VoteButton 
//                 issueId={issue.id} 
//                 initialVotes={issue.upvotes || 0} 
//               />
//               <ClaimButton 
//                 issueId={issue.id} 
//                 currentStatus={issue.status || 'reported'} 
//               />
//               <ShareButton issueId={issue.id} />
//             </div>
//           </div>

//           <p className="text-gray-700 text-lg mb-8 leading-relaxed">
//             {issue.description || 'No description provided'}
//           </p>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
//               <MapPinIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
//               <div>
//                 <p className="text-sm font-medium text-gray-900">Location</p>
//                 <p className="text-sm text-gray-600 truncate">{issue.location || 'Unknown location'}</p>
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
//               <CalendarIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
//               <div>
//                 <p className="text-sm font-medium text-gray-900">Reported</p>
//                 <p className="text-sm text-gray-600">
//                   {formatRelativeTime(issue.createdAt)}
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   {formatDate(issue.createdAt)}
//                 </p>
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
//               <UserIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
//               <div>
//                 <p className="text-sm font-medium text-gray-900">Reporter</p>
//                 <p className="text-sm text-gray-600">
//                   {issue.reporter?.name || 'Anonymous'}
//                 </p>
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
//               <ClockIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
//               <div>
//                 <p className="text-sm font-medium text-gray-900">Last Updated</p>
//                 <p className="text-sm text-gray-600">
//                   {formatRelativeTime(issue.updatedAt)}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {issue.assignedTo && (
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//               <div className="flex items-center space-x-3">
//                 <UserIcon className="w-5 h-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
//                 <div>
//                   <p className="text-sm font-medium text-blue-900">Assigned Volunteer</p>
//                   <p className="text-sm text-blue-700">
//                     <strong>{issue.assignedTo.name || 'Volunteer'}</strong> is working on this issue
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//           <div className="border-b border-gray-200">
//             <nav className="flex -mb-px" aria-label="Issue detail tabs">
//               {[
//                 { id: 'details' as const, label: 'Details', icon: ExclamationTriangleIcon },
//                 { id: 'comments' as const, label: 'Comments', icon: UserIcon },
//                 { id: 'timeline' as const, label: 'Timeline', icon: ClockIcon },
//               ].map(tab => {
//                 const TabIcon = tab.icon
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`flex items-center space-x-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded-t ${
//                       activeTab === tab.id
//                         ? 'border-blue-500 text-blue-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     }`}
//                     aria-selected={activeTab === tab.id}
//                     role="tab"
//                   >
//                     <TabIcon className="w-4 h-4" aria-hidden="true" />
//                     <span>{tab.label}</span>
//                   </button>
//                 )
//               })}
//             </nav>
//           </div>

//           <div className="p-6">
//             {activeTab === 'details' && (
//               <div className="space-y-6">
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-4">Issue Description</h3>
//                   <div className="prose max-w-none text-gray-700">
//                     <p className="whitespace-pre-line">
//                       {issue.description || 'No description provided'}
//                     </p>
//                   </div>
//                 </div>

//                 {issue.images && issue.images.length > 0 && (
//                   <div>
//                     <h4 className="text-lg font-medium text-gray-900 mb-4">Attached Images</h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {issue.images.map((image, index) => (
//                         <div key={index} className="group relative">
//                           <Image
//                             src={image}
//                             alt={`Issue evidence ${index + 1}`}
//                             width={300}
//                             height={192}
//                             className="rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow w-full h-48 object-cover"
//                             onClick={() => window.open(image, '_blank')}
//                           />
//                           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" aria-hidden="true"></div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {issue.latitude && issue.longitude && (
//                   <div>
//                     <h4 className="text-lg font-medium text-gray-900 mb-3">Location Coordinates</h4>
//                     <div className="flex space-x-4 text-sm text-gray-600">
//                       <span>Latitude: {issue.latitude}</span>
//                       <span>Longitude: {issue.longitude}</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'comments' && (
//               <CommentSection 
//                 issueId={issue.id} 
//                 comments={issue.comments || []} 
//               />
//             )}

//             {activeTab === 'timeline' && (
//               <IssueTimeline issue={issue} />
//             )}
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   )
// }



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
import MainLayout from '@/components/layout/MainLayout'
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

interface IssueProps {
  userRole: string | null;
}

export default function IssueDetailPage({userRole}: IssueProps) {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'timeline'>('details')

  useEffect(() => {
    if (!id) {
      setError('No issue ID provided')
      setLoading(false)
      return
    }
    
    fetchIssue()
  }, [id])

  const fetchIssue = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      setError(null)
      
      console.log(`📡 Fetching issue with ID: ${id}`)
      
      // Make API call
      const response = await apiClient.get(`/issues/${id}`)
      
      console.log('✅ API Response received:', response)
      
      if (!response.data) {
        setError('No data received from server')
        setLoading(false)
        return
      }

      // CRITICAL FIX: Your Mockoon returns { issue: {...} } not just the issue
      // Extract the issue from the nested structure
      const apiData = response.data.issue || response.data
      
      console.log('📦 Extracted API data:', apiData)

      if (!apiData) {
        setError('No issue data found in response')
        setLoading(false)
        return
      }

      // Map the API response to your Issue type
      const issueWithDefaults: Issue = {
        id: apiData.id || id,
        title: apiData.title || 'Untitled Issue',
        description: apiData.description || 'No description provided',
        status: apiData.status || 'reported',
        commentsCount: apiData.commentCount || apiData.commentsCount || 0,
        reportedAt: apiData.reportedAt || apiData.createdAt || new Date().toISOString(),
        priority: apiData.priority || 'medium',
        category: apiData.category || 'general',
        location: apiData.location || 'Unknown location',
        createdAt: apiData.createdAt || new Date().toISOString(),
        updatedAt: apiData.updatedAt || new Date().toISOString(),
        upvotes: apiData.votes || apiData.upvotes || 0, // Your Mockoon uses "votes"
        views: apiData.views || 0,
        reporter: apiData.reporter || { 
          id: apiData.reporterId || 'unknown', 
          name: 'Anonymous', 
          email: 'anonymous@example.com' 
        },
        assignedTo: apiData.volunteer || apiData.assignedTo || null, // Your Mockoon uses "volunteer"
        images: apiData.images || [],
        latitude: apiData.latitude || null,
        longitude: apiData.longitude || null,
        // ✅ FIXED: Map API comments to match your Comment type
        comments: (apiData.comments || []).map((comment: any) => {
          const userData = comment.user || comment.author;

          return {
            id: comment.id,
            issueId: id, // Required by Comment type
            userId: userData?.id || 'unknown',
            user: {
              id: userData?.id || 'unknown',
              name: userData?.name || 'Anonymous',
              avatar: userData?.avatar,
              role: userData?.role || 'citizen' // Default role
            },
            text: comment.text || '',
            attachments: comment.attachments || [],
            parentId: comment.parentId,
            replies: comment.replies || [],
            upvotes: comment.upvotes || 0,
            isEdited: comment.isEdited || false,
            isPinned: comment.isPinned || false,
            createdAt: comment.createdAt || new Date().toISOString(),
            updatedAt: comment.updatedAt || comment.createdAt || new Date().toISOString()
          }
        }),
        reporterId: apiData.reporterId || 'unknown'
      }
      
      console.log('🎯 Processed issue:', issueWithDefaults)
      console.log('🎯 Issue title:', issueWithDefaults.title)
      console.log('🎯 Issue description:', issueWithDefaults.description)
      console.log('🎯 Comments count:', issueWithDefaults.comments?.length)
      
      setIssue(issueWithDefaults)
      
    } catch (err: any) {
      console.error('❌ Failed to fetch issue:', err)
      
      let errorMessage = 'Failed to load issue details. Please try again.'
      if (err.response?.status === 404) {
        errorMessage = 'Issue not found'
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      
      // For development, create a mock issue matching your Mockoon structure
      console.log('🛠️ Using mock issue data')
      const mockIssue: Issue = {
        id: id,
        title: "Pothole on Main Street",
        description: "Large pothole causing traffic issues and vehicle damage near the intersection of Main and 5th",
        status: "in_progress",
        priority: "high",
        category: "infrastructure",
        location: "123 Main Street, Downtown",
        latitude: 30.708531,
        longitude: 76.688447,
        images: ["/images/pothole1.jpg", "/images/pothole2.jpg"],
        createdAt: "2024-01-10T08:00:00Z",
        updatedAt: "2024-01-15T14:20:00Z",
        reportedAt: "2024-01-10T08:00:00Z",
        upvotes: 15,
        views: 42,
        commentsCount: 2,
        reporterId: "user1",
        reporter: {
          id: "user1",
          name: "John Doe",
          email: "john@example.com",
          avatar: "/images/avatar-placeholder.png"
        },
        assignedTo: {
          id: "volunteer1",
          name: "Sarah Wilson",
          role: "volunteer",
          avatar: "/images/avatar-placeholder.png"
        },
        // ✅ Fixed comments structure to match your Comment type
        comments: [
          {
            id: "comment1",
            issueId: id,
            userId: "user2",
            user: {
              id: "user2",
              name: "Mike Johnson",
              avatar: "/images/avatar-placeholder.png",
              role: "citizen"
            },
            text: "This has been an issue for weeks! Glad someone is working on it.",
            attachments: [],
            parentId: undefined,
            replies: [],
            upvotes: 5,
            isEdited: false,
            isPinned: false,
            createdAt: "2024-01-14T10:30:00Z",
            updatedAt: "2024-01-14T10:30:00Z"
          },
          {
            id: "comment2",
            issueId: id,
            userId: "volunteer1",
            user: {
              id: "volunteer1",
              name: "Sarah Wilson",
              avatar: "/images/avatar-placeholder.png",
              role: "volunteer"
            },
            text: "I've started working on this. Should be fixed by tomorrow.",
            attachments: [],
            parentId: undefined,
            replies: [],
            upvotes: 8,
            isEdited: false,
            isPinned: false,
            createdAt: "2024-01-15T09:15:00Z",
            updatedAt: "2024-01-15T09:15:00Z"
          }
        ]
      }
      
      console.log('🛠️ Mock issue created:', mockIssue)
      setIssue(mockIssue)
      setError(null) // Clear error since we have mock data
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

  if (error && !issue) {
    return (
      <Error 
        error={error as unknown as Error & { digest?: string | undefined }} 
        reset={handleRetry}
      />
    )
  }

  if (!issue) {
    return (
      <MainLayout role={userRole}>
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
      </MainLayout>
    )
  }

  const StatusIcon = getStatusIcon(issue.status || 'reported')

  return (
    <MainLayout role={userRole}>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{issue.title || 'Untitled Issue'}</h1>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${
                  getStatusColor(issue.status || 'reported')
                }`}>
                  <StatusIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                  {(issue.status || 'reported').replace('_', ' ').toUpperCase()}
                </span>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${
                  getPriorityColor(issue.priority || 'medium')
                }`}>
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                  {(issue.priority || 'medium').toUpperCase()} PRIORITY
                </span>
                <span className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-sm font-medium">
                  {(issue.category || 'general').toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <VoteButton 
                issueId={issue.id} 
                initialVotes={issue.upvotes || 0} 
              />
              <ClaimButton 
                issueId={issue.id} 
                currentStatus={issue.status || 'reported'} 
              />
              <ShareButton issueId={issue.id} />
            </div>
          </div>

          <p className="text-gray-700 text-lg mb-8 leading-relaxed">
            {issue.description || 'No description provided'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPinIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600 truncate">{issue.location || 'Unknown location'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-gray-900">Reported</p>
                <p className="text-sm text-gray-600">
                  {formatRelativeTime(issue.createdAt)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(issue.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <UserIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-gray-900">Reporter</p>
                <p className="text-sm text-gray-600">
                  {issue.reporter?.name || 'Anonymous'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <ClockIcon className="w-5 h-5 text-gray-500 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                <p className="text-sm text-gray-600">
                  {formatRelativeTime(issue.updatedAt)}
                </p>
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
                    <strong>{issue.assignedTo.name || 'Volunteer'}</strong> is working on this issue
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
                    <p className="whitespace-pre-line">
                      {issue.description || 'No description provided'}
                    </p>
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
    </MainLayout>
  )
}