// // // 'use client'

// // // import { useState } from 'react'

// // // interface PendingVolunteer {
// // //   _id: string;
// // //   name: string;
// // //   email: string;
// // //   skills: string[];
// // //   experienceLevel: string;
// // //   phone?: string;
// // //   bio?: string;
// // //   createdAt: string;
// // // }

// // // interface PendingVolunteersSectionProps {
// // //   pendingVolunteers: PendingVolunteer[];
// // //   loading: boolean;
// // //   onApprove: (volunteerId: string) => Promise<void>;
// // //   onReject: (volunteerId: string) => Promise<void>;
// // // }

// // // export default function PendingVolunteersSection({
// // //   pendingVolunteers,
// // //   loading,
// // //   onApprove,
// // //   onReject
// // // }: PendingVolunteersSectionProps) {
// // //   const [processingId, setProcessingId] = useState<string | null>(null);
// // //   const [expandedId, setExpandedId] = useState<string | null>(null);

// // //   if (loading) {
// // //     return (
// // //       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// // //         <div className="flex items-center justify-between mb-4">
// // //           <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
// // //           <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Loading...</span>
// // //         </div>
// // //         <div className="animate-pulse space-y-4">
// // //           <div className="h-20 bg-gray-100 rounded"></div>
// // //           <div className="h-20 bg-gray-100 rounded"></div>
// // //         </div>
// // //       </div>
// // //     )
// // //   }

// // //   if (pendingVolunteers.length === 0) {
// // //     return (
// // //       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// // //         <div className="flex items-center justify-between mb-2">
// // //           <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
// // //           <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">All Clear</span>
// // //         </div>
// // //         <p className="text-gray-500 text-sm">No pending volunteer applications.</p>
// // //       </div>
// // //     )
// // //   }

// // //   return (
// // //     <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
// // //       <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-4">
// // //         <div className="flex items-center justify-between">
// // //           <div className="flex items-center gap-2">
// // //             <span className="text-yellow-600 text-xl">⏳</span>
// // //             <h2 className="text-lg font-semibold text-gray-900">
// // //               Pending Volunteer Approvals
// // //             </h2>
// // //             <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-2">
// // //               {pendingVolunteers.length} pending
// // //             </span>
// // //           </div>
// // //           <p className="text-sm text-gray-600">
// // //             Review and approve/reject volunteer applications
// // //           </p>
// // //         </div>
// // //       </div>

// // //       <div className="divide-y divide-gray-200">
// // //         {pendingVolunteers.map((volunteer) => (
// // //           <div key={volunteer._id} className="p-6 hover:bg-gray-50 transition-colors">
// // //             <div className="flex justify-between items-start">
// // //               <div className="flex-1">
// // //                 {/* Header */}
// // //                 <div className="flex items-center gap-3 flex-wrap mb-3">
// // //                   <h3 className="text-lg font-semibold text-gray-900">
// // //                     {volunteer.name}
// // //                   </h3>
// // //                   <span className="text-sm text-gray-500">
// // //                     {volunteer.email}
// // //                   </span>
// // //                   {volunteer.phone && (
// // //                     <span className="text-sm text-gray-500 flex items-center gap-1">
// // //                       📞 {volunteer.phone}
// // //                     </span>
// // //                   )}
// // //                 </div>

// // //                 {/* Meta info */}
// // //                 <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
// // //                   <span>Applied: {new Date(volunteer.createdAt).toLocaleDateString()}</span>
// // //                   <span className="capitalize">Experience: {volunteer.experienceLevel}</span>
// // //                 </div>

// // //                 {/* Skills */}
// // //                 <div className="mb-3">
// // //                   <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
// // //                   <div className="flex flex-wrap gap-2">
// // //                     {volunteer.skills.map((skill) => (
// // //                       <span
// // //                         key={skill}
// // //                         className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
// // //                       >
// // //                         {skill}
// // //                       </span>
// // //                     ))}
// // //                   </div>
// // //                 </div>

// // //                 {/* Bio - Collapsible */}
// // //                 {volunteer.bio && (
// // //                   <div className="mt-2">
// // //                     <button
// // //                       onClick={() => setExpandedId(expandedId === volunteer._id ? null : volunteer._id)}
// // //                       className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
// // //                     >
// // //                       {expandedId === volunteer._id ? '▼ Hide Bio' : '▶ Show Bio'}
// // //                     </button>
// // //                     {expandedId === volunteer._id && (
// // //                       <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
// // //                         {volunteer.bio}
// // //                       </p>
// // //                     )}
// // //                   </div>
// // //                 )}
// // //               </div>

// // //               {/* Action Buttons */}
// // //               <div className="flex gap-2 ml-4">
// // //                 <button
// // //                   onClick={() => {
// // //                     setProcessingId(volunteer._id);
// // //                     onApprove(volunteer._id).finally(() => setProcessingId(null));
// // //                   }}
// // //                   disabled={processingId === volunteer._id}
// // //                   className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
// // //                 >
// // //                   {processingId === volunteer._id ? 'Processing...' : '✓ Approve'}
// // //                 </button>
// // //                 <button
// // //                   onClick={() => {
// // //                     setProcessingId(volunteer._id);
// // //                     onReject(volunteer._id).finally(() => setProcessingId(null));
// // //                   }}
// // //                   disabled={processingId === volunteer._id}
// // //                   className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
// // //                 >
// // //                   {processingId === volunteer._id ? 'Processing...' : '✗ Reject'}
// // //                 </button>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         ))}
// // //       </div>
// // //     </div>
// // //   )
// // // }


// // 'use client'

// // import { useState } from 'react'

// // interface PendingVolunteer {
// //   _id: string
// //   name: string
// //   email: string
// //   skills: string[]
// //   experienceLevel: string
// //   phone?: string
// //   bio?: string
// //   createdAt: string
// //   avatar?: string
// //   location?: string
// // }

// // interface Props {
// //   pendingVolunteers: PendingVolunteer[]
// //   loading: boolean
// //   onApprove: (id: string) => Promise<void>
// //   onReject: (id: string) => Promise<void>
// // }

// // export default function PendingVolunteersSection({
// //   pendingVolunteers,
// //   loading,
// //   onApprove,
// //   onReject,
// // }: Props) {
// //   const [processingId, setProcessingId] = useState<string | null>(null)
// //   const [expandedId, setExpandedId] = useState<string | null>(null)
// //   const [rejectModalId, setRejectModalId] = useState<string | null>(null)
// //   const [rejectReason, setRejectReason] = useState('')

// //   const handleApprove = async (id: string) => {
// //     setProcessingId(id)
// //     try {
// //       await onApprove(id)
// //     } finally {
// //       setProcessingId(null)
// //     }
// //   }

// //   const handleRejectConfirm = async () => {
// //     if (!rejectModalId) return
// //     setProcessingId(rejectModalId)
// //     try {
// //       await onReject(rejectModalId)
// //       setRejectModalId(null)
// //       setRejectReason('')
// //     } finally {
// //       setProcessingId(null)
// //     }
// //   }

// //   const formatDate = (dateStr: string) => {
// //     return new Date(dateStr).toLocaleDateString('en-IN', {
// //       day: 'numeric',
// //       month: 'short',
// //       year: 'numeric',
// //     })
// //   }

// //   // Loading state
// //   if (loading) {
// //     return (
// //       <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
// //         <div className="flex items-center gap-3 mb-4">
// //           <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
// //           <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
// //         </div>
// //         <div className="space-y-3">
// //           {[1, 2].map((i) => (
// //             <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
// //           ))}
// //         </div>
// //       </div>
// //     )
// //   }

// //   // Koi pending nahi
// //   if (pendingVolunteers.length === 0) {
// //     return (
// //       <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
// //         <div className="flex items-center gap-2 mb-3">
// //           <span className="text-lg">✅</span>
// //           <h2 className="text-lg font-semibold text-gray-800">Pending Volunteer Approvals</h2>
// //           <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
// //             All clear
// //           </span>
// //         </div>
// //         <p className="text-sm text-gray-500">Koi pending volunteer application nahi hai.</p>
// //       </div>
// //     )
// //   }

// //   return (
// //     <>
// //       <div className="bg-white rounded-xl border border-amber-200 shadow-sm mb-6 overflow-hidden">
// //         {/* Header */}
// //         <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50">
// //           <div className="flex items-center gap-3">
// //             <span className="text-xl">⏳</span>
// //             <div>
// //               <h2 className="text-base font-semibold text-gray-800">Pending Volunteer Approvals</h2>
// //               <p className="text-xs text-gray-500 mt-0.5">In volunteers nu approve ya reject karna hai</p>
// //             </div>
// //           </div>
// //           <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
// //             {pendingVolunteers.length} Pending
// //           </span>
// //         </div>

// //         {/* Volunteer Cards */}
// //         <div className="divide-y divide-gray-100">
// //           {pendingVolunteers.map((volunteer) => {
// //             const isExpanded = expandedId === volunteer._id
// //             const isProcessing = processingId === volunteer._id

// //             return (
// //               <div key={volunteer._id} className="p-5">
// //                 {/* Top Row */}
// //                 <div className="flex items-start gap-4">
// //                   {/* Avatar */}
// //                   <div className="flex-shrink-0">
// //                     {volunteer.avatar ? (
// //                       <img
// //                         src={volunteer.avatar}
// //                         alt={volunteer.name}
// //                         className="w-11 h-11 rounded-full object-cover border-2 border-gray-200"
// //                       />
// //                     ) : (
// //                       <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
// //                         {volunteer.name.charAt(0).toUpperCase()}
// //                       </div>
// //                     )}
// //                   </div>

// //                   {/* Info */}
// //                   <div className="flex-1 min-w-0">
// //                     <div className="flex items-center gap-2 flex-wrap">
// //                       <span className="font-semibold text-gray-900 text-sm">{volunteer.name}</span>
// //                       {volunteer.experienceLevel && (
// //                         <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full capitalize">
// //                           {volunteer.experienceLevel}
// //                         </span>
// //                       )}
// //                     </div>
// //                     <p className="text-xs text-gray-500 mt-0.5 truncate">{volunteer.email}</p>
// //                     <div className="flex items-center gap-3 mt-1 flex-wrap">
// //                       {volunteer.phone && (
// //                         <span className="text-xs text-gray-500">📞 {volunteer.phone}</span>
// //                       )}
// //                       {volunteer.location && (
// //                         <span className="text-xs text-gray-500">📍 {volunteer.location}</span>
// //                       )}
// //                       <span className="text-xs text-gray-400">
// //                         Applied: {formatDate(volunteer.createdAt)}
// //                       </span>
// //                     </div>
// //                   </div>

// //                   {/* Action Buttons */}
// //                   <div className="flex items-center gap-2 flex-shrink-0">
// //                     <button
// //                       onClick={() => setExpandedId(isExpanded ? null : volunteer._id)}
// //                       className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
// //                     >
// //                       {isExpanded ? '▲ Less' : '▼ More'}
// //                     </button>
// //                     <button
// //                       onClick={() => setRejectModalId(volunteer._id)}
// //                       disabled={isProcessing}
// //                       className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
// //                     >
// //                       ✕ Reject
// //                     </button>
// //                     <button
// //                       onClick={() => handleApprove(volunteer._id)}
// //                       disabled={isProcessing}
// //                       className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
// //                     >
// //                       {isProcessing ? (
// //                         <>
// //                           <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
// //                           Processing...
// //                         </>
// //                       ) : (
// //                         '✓ Approve'
// //                       )}
// //                     </button>
// //                   </div>
// //                 </div>

// //                 {/* Skills Row */}
// //                 {volunteer.skills && volunteer.skills.length > 0 && (
// //                   <div className="mt-3 flex flex-wrap gap-1.5">
// //                     {volunteer.skills.slice(0, isExpanded ? undefined : 4).map((skill) => (
// //                       <span
// //                         key={skill}
// //                         className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
// //                       >
// //                         {skill}
// //                       </span>
// //                     ))}
// //                     {!isExpanded && volunteer.skills.length > 4 && (
// //                       <span className="text-xs text-gray-400 px-1">
// //                         +{volunteer.skills.length - 4} more
// //                       </span>
// //                     )}
// //                   </div>
// //                 )}

// //                 {/* Expanded Bio */}
// //                 {isExpanded && volunteer.bio && (
// //                   <div className="mt-3 p-3 bg-gray-50 rounded-lg">
// //                     <p className="text-xs font-medium text-gray-600 mb-1">Bio / About</p>
// //                     <p className="text-sm text-gray-700 leading-relaxed">{volunteer.bio}</p>
// //                   </div>
// //                 )}
// //               </div>
// //             )
// //           })}
// //         </div>
// //       </div>

// //       {/* Reject Reason Modal */}
// //       {rejectModalId && (
// //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
// //           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
// //             <h3 className="text-base font-semibold text-gray-900 mb-1">Volunteer Reject Karo</h3>
// //             <p className="text-sm text-gray-500 mb-4">
// //               Rejection ka reason dasao (optional hai)
// //             </p>
// //             <textarea
// //               value={rejectReason}
// //               onChange={(e) => setRejectReason(e.target.value)}
// //               placeholder="e.g. Skills match nahi kardi, incomplete profile..."
// //               rows={3}
// //               className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
// //             />
// //             <div className="flex justify-end gap-3 mt-4">
// //               <button
// //                 onClick={() => {
// //                   setRejectModalId(null)
// //                   setRejectReason('')
// //                 }}
// //                 className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={handleRejectConfirm}
// //                 disabled={processingId === rejectModalId}
// //                 className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
// //               >
// //                 {processingId === rejectModalId ? (
// //                   <>
// //                     <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
// //                     Rejecting...
// //                   </>
// //                 ) : (
// //                   'Confirm Reject'
// //                 )}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   )
// // }



// // 'use client'

// // import { useState } from 'react'

// // interface PendingVolunteer {
// //   _id: string;
// //   name: string;
// //   email: string;
// //   skills: string[];
// //   experienceLevel: string;
// //   phone?: string;
// //   bio?: string;
// //   createdAt: string;
// // }

// // interface PendingVolunteersSectionProps {
// //   pendingVolunteers: PendingVolunteer[];
// //   loading: boolean;
// //   onApprove: (volunteerId: string) => Promise<void>;
// //   onReject: (volunteerId: string) => Promise<void>;
// // }

// // export default function PendingVolunteersSection({
// //   pendingVolunteers,
// //   loading,
// //   onApprove,
// //   onReject
// // }: PendingVolunteersSectionProps) {
// //   const [processingId, setProcessingId] = useState<string | null>(null);
// //   const [expandedId, setExpandedId] = useState<string | null>(null);

// //   if (loading) {
// //     return (
// //       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// //         <div className="flex items-center justify-between mb-4">
// //           <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
// //           <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Loading...</span>
// //         </div>
// //         <div className="animate-pulse space-y-4">
// //           <div className="h-20 bg-gray-100 rounded"></div>
// //           <div className="h-20 bg-gray-100 rounded"></div>
// //         </div>
// //       </div>
// //     )
// //   }

// //   if (pendingVolunteers.length === 0) {
// //     return (
// //       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// //         <div className="flex items-center justify-between mb-2">
// //           <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
// //           <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">All Clear</span>
// //         </div>
// //         <p className="text-gray-500 text-sm">No pending volunteer applications.</p>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
// //       <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-4">
// //         <div className="flex items-center justify-between">
// //           <div className="flex items-center gap-2">
// //             <span className="text-yellow-600 text-xl">⏳</span>
// //             <h2 className="text-lg font-semibold text-gray-900">
// //               Pending Volunteer Approvals
// //             </h2>
// //             <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-2">
// //               {pendingVolunteers.length} pending
// //             </span>
// //           </div>
// //           <p className="text-sm text-gray-600">
// //             Review and approve/reject volunteer applications
// //           </p>
// //         </div>
// //       </div>

// //       <div className="divide-y divide-gray-200">
// //         {pendingVolunteers.map((volunteer) => (
// //           <div key={volunteer._id} className="p-6 hover:bg-gray-50 transition-colors">
// //             <div className="flex justify-between items-start">
// //               <div className="flex-1">
// //                 {/* Header */}
// //                 <div className="flex items-center gap-3 flex-wrap mb-3">
// //                   <h3 className="text-lg font-semibold text-gray-900">
// //                     {volunteer.name}
// //                   </h3>
// //                   <span className="text-sm text-gray-500">
// //                     {volunteer.email}
// //                   </span>
// //                   {volunteer.phone && (
// //                     <span className="text-sm text-gray-500 flex items-center gap-1">
// //                       📞 {volunteer.phone}
// //                     </span>
// //                   )}
// //                 </div>

// //                 {/* Meta info */}
// //                 <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
// //                   <span>Applied: {new Date(volunteer.createdAt).toLocaleDateString()}</span>
// //                   <span className="capitalize">Experience: {volunteer.experienceLevel}</span>
// //                 </div>

// //                 {/* Skills */}
// //                 <div className="mb-3">
// //                   <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
// //                   <div className="flex flex-wrap gap-2">
// //                     {volunteer.skills.map((skill) => (
// //                       <span
// //                         key={skill}
// //                         className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
// //                       >
// //                         {skill}
// //                       </span>
// //                     ))}
// //                   </div>
// //                 </div>

// //                 {/* Bio - Collapsible */}
// //                 {volunteer.bio && (
// //                   <div className="mt-2">
// //                     <button
// //                       onClick={() => setExpandedId(expandedId === volunteer._id ? null : volunteer._id)}
// //                       className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
// //                     >
// //                       {expandedId === volunteer._id ? '▼ Hide Bio' : '▶ Show Bio'}
// //                     </button>
// //                     {expandedId === volunteer._id && (
// //                       <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
// //                         {volunteer.bio}
// //                       </p>
// //                     )}
// //                   </div>
// //                 )}
// //               </div>

// //               {/* Action Buttons */}
// //               <div className="flex gap-2 ml-4">
// //                 <button
// //                   onClick={() => {
// //                     setProcessingId(volunteer._id);
// //                     onApprove(volunteer._id).finally(() => setProcessingId(null));
// //                   }}
// //                   disabled={processingId === volunteer._id}
// //                   className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
// //                 >
// //                   {processingId === volunteer._id ? 'Processing...' : '✓ Approve'}
// //                 </button>
// //                 <button
// //                   onClick={() => {
// //                     setProcessingId(volunteer._id);
// //                     onReject(volunteer._id).finally(() => setProcessingId(null));
// //                   }}
// //                   disabled={processingId === volunteer._id}
// //                   className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
// //                 >
// //                   {processingId === volunteer._id ? 'Processing...' : '✗ Reject'}
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   )
// // }


// 'use client'

// import { useState } from 'react'

// interface PendingVolunteer {
//   _id: string
//   name: string
//   email: string
//   skills: string[]
//   experienceLevel: string
//   phone?: string
//   bio?: string
//   createdAt: string
//   avatar?: string
//   location?: string
// }

// interface Props {
//   pendingVolunteers: PendingVolunteer[]
//   loading: boolean
//   onApprove: (id: string) => Promise<void>
//   onReject: (id: string) => Promise<void>
// }

// export default function PendingVolunteersSection({
//   pendingVolunteers,
//   loading,
//   onApprove,
//   onReject,
// }: Props) {
//   const [processingId, setProcessingId] = useState<string | null>(null)
//   const [expandedId, setExpandedId] = useState<string | null>(null)
//   const [rejectModalId, setRejectModalId] = useState<string | null>(null)
//   const [rejectReason, setRejectReason] = useState('')

//   const handleApprove = async (id: string) => {
//     setProcessingId(id)
//     try {
//       await onApprove(id)
//     } finally {
//       setProcessingId(null)
//     }
//   }

//   const handleRejectConfirm = async () => {
//     if (!rejectModalId) return
//     setProcessingId(rejectModalId)
//     try {
//       await onReject(rejectModalId)
//       setRejectModalId(null)
//       setRejectReason('')
//     } finally {
//       setProcessingId(null)
//     }
//   }

//   const formatDate = (dateStr: string) => {
//     return new Date(dateStr).toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//     })
//   }

//   // Loading state
//   if (loading) {
//     return (
//       <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
//         <div className="flex items-center gap-3 mb-4">
//           <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
//           <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
//         </div>
//         <div className="space-y-3">
//           {[1, 2].map((i) => (
//             <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
//           ))}
//         </div>
//       </div>
//     )
//   }

//   // Koi pending nahi
//   if (pendingVolunteers.length === 0) {
//     return (
//       <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
//         <div className="flex items-center gap-2 mb-3">
//           <span className="text-lg">✅</span>
//           <h2 className="text-lg font-semibold text-gray-800">Pending Volunteer Approvals</h2>
//           <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
//             All clear
//           </span>
//         </div>
//         <p className="text-sm text-gray-500">No pending volunteer applications.</p>
//       </div>
//     )
//   }

//   return (
//     <>
//       <div className="bg-white rounded-xl border border-amber-200 shadow-sm mb-6 overflow-hidden">
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50">
//           <div className="flex items-center gap-3">
//             <span className="text-xl">⏳</span>
//             <div>
//               <h2 className="text-base font-semibold text-gray-800">Pending Volunteer Approvals</h2>
//               <p className="text-xs text-gray-500 mt-0.5">Review and approve or reject volunteer applications</p>
//             </div>
//           </div>
//           <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
//             {pendingVolunteers.length} Pending
//           </span>
//         </div>

//         {/* Volunteer Cards */}
//         <div className="divide-y divide-gray-100">
//           {pendingVolunteers.map((volunteer) => {
//             const isExpanded = expandedId === volunteer._id
//             const isProcessing = processingId === volunteer._id

//             return (
//               <div key={volunteer._id} className="p-5">
//                 {/* Top Row */}
//                 <div className="flex items-start gap-4">
//                   {/* Avatar */}
//                   <div className="flex-shrink-0">
//                     {volunteer.avatar ? (
//                       <img
//                         src={volunteer.avatar}
//                         alt={volunteer.name}
//                         className="w-11 h-11 rounded-full object-cover border-2 border-gray-200"
//                       />
//                     ) : (
//                       <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
//                         {volunteer.name.charAt(0).toUpperCase()}
//                       </div>
//                     )}
//                   </div>

//                   {/* Info */}
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 flex-wrap">
//                       <span className="font-semibold text-gray-900 text-sm">{volunteer.name}</span>
//                       {volunteer.experienceLevel && (
//                         <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full capitalize">
//                           {volunteer.experienceLevel}
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-xs text-gray-500 mt-0.5 truncate">{volunteer.email}</p>
//                     <div className="flex items-center gap-3 mt-1 flex-wrap">
//                       {volunteer.phone && (
//                         <span className="text-xs text-gray-500">📞 {volunteer.phone}</span>
//                       )}
//                       {volunteer.location && (
//                         <span className="text-xs text-gray-500">📍 {volunteer.location}</span>
//                       )}
//                       <span className="text-xs text-gray-400">
//                         Applied: {formatDate(volunteer.createdAt)}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="flex items-center gap-2 flex-shrink-0">
//                     <button
//                       onClick={() => setExpandedId(isExpanded ? null : volunteer._id)}
//                       className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
//                     >
//                       {isExpanded ? '▲ Less' : '▼ More'}
//                     </button>
//                     <button
//                       onClick={() => setRejectModalId(volunteer._id)}
//                       disabled={isProcessing}
//                       className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       ✕ Reject
//                     </button>
//                     <button
//                       onClick={() => handleApprove(volunteer._id)}
//                       disabled={isProcessing}
//                       className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
//                     >
//                       {isProcessing ? (
//                         <>
//                           <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                           Processing...
//                         </>
//                       ) : (
//                         '✓ Approve'
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Skills Row */}
//                 {volunteer.skills && volunteer.skills.length > 0 && (
//                   <div className="mt-3 flex flex-wrap gap-1.5">
//                     {volunteer.skills.slice(0, isExpanded ? undefined : 4).map((skill) => (
//                       <span
//                         key={skill}
//                         className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
//                       >
//                         {skill}
//                       </span>
//                     ))}
//                     {!isExpanded && volunteer.skills.length > 4 && (
//                       <span className="text-xs text-gray-400 px-1">
//                         +{volunteer.skills.length - 4} more
//                       </span>
//                     )}
//                   </div>
//                 )}

//                 {/* Expanded Bio */}
//                 {isExpanded && volunteer.bio && (
//                   <div className="mt-3 p-3 bg-gray-50 rounded-lg">
//                     <p className="text-xs font-medium text-gray-600 mb-1">Bio / About</p>
//                     <p className="text-sm text-gray-700 leading-relaxed">{volunteer.bio}</p>
//                   </div>
//                 )}
//               </div>
//             )
//           })}
//         </div>
//       </div>

//       {/* Reject Reason Modal */}
//       {rejectModalId && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
//             <h3 className="text-base font-semibold text-gray-900 mb-1">Volunteer Reject Karo</h3>
//             <p className="text-sm text-gray-500 mb-4">
//               Rejection ka reason dasao (optional hai)
//             </p>
//             <textarea
//               value={rejectReason}
//               onChange={(e) => setRejectReason(e.target.value)}
//               placeholder="e.g. Skills match nahi kardi, incomplete profile..."
//               rows={3}
//               className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
//             />
//             <div className="flex justify-end gap-3 mt-4">
//               <button
//                 onClick={() => {
//                   setRejectModalId(null)
//                   setRejectReason('')
//                 }}
//                 className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleRejectConfirm}
//                 disabled={processingId === rejectModalId}
//                 className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
//               >
//                 {processingId === rejectModalId ? (
//                   <>
//                     <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     Rejecting...
//                   </>
//                 ) : (
//                   'Confirm Reject'
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }



// 'use client'

// import { useState } from 'react'

// interface PendingVolunteer {
//   _id: string;
//   name: string;
//   email: string;
//   skills: string[];
//   experienceLevel: string;
//   phone?: string;
//   bio?: string;
//   createdAt: string;
// }

// interface PendingVolunteersSectionProps {
//   pendingVolunteers: PendingVolunteer[];
//   loading: boolean;
//   onApprove: (volunteerId: string) => Promise<void>;
//   onReject: (volunteerId: string) => Promise<void>;
// }

// export default function PendingVolunteersSection({
//   pendingVolunteers,
//   loading,
//   onApprove,
//   onReject
// }: PendingVolunteersSectionProps) {
//   const [processingId, setProcessingId] = useState<string | null>(null);
//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   if (loading) {
//     return (
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
//           <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Loading...</span>
//         </div>
//         <div className="animate-pulse space-y-4">
//           <div className="h-20 bg-gray-100 rounded"></div>
//           <div className="h-20 bg-gray-100 rounded"></div>
//         </div>
//       </div>
//     )
//   }

//   if (pendingVolunteers.length === 0) {
//     return (
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
//         <div className="flex items-center justify-between mb-2">
//           <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
//           <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">All Clear</span>
//         </div>
//         <p className="text-gray-500 text-sm">No pending volunteer applications.</p>
//       </div>
//     )
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
//       <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <span className="text-yellow-600 text-xl">⏳</span>
//             <h2 className="text-lg font-semibold text-gray-900">
//               Pending Volunteer Approvals
//             </h2>
//             <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-2">
//               {pendingVolunteers.length} pending
//             </span>
//           </div>
//           <p className="text-sm text-gray-600">
//             Review and approve/reject volunteer applications
//           </p>
//         </div>
//       </div>

//       <div className="divide-y divide-gray-200">
//         {pendingVolunteers.map((volunteer) => (
//           <div key={volunteer._id} className="p-6 hover:bg-gray-50 transition-colors">
//             <div className="flex justify-between items-start">
//               <div className="flex-1">
//                 {/* Header */}
//                 <div className="flex items-center gap-3 flex-wrap mb-3">
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     {volunteer.name}
//                   </h3>
//                   <span className="text-sm text-gray-500">
//                     {volunteer.email}
//                   </span>
//                   {volunteer.phone && (
//                     <span className="text-sm text-gray-500 flex items-center gap-1">
//                       📞 {volunteer.phone}
//                     </span>
//                   )}
//                 </div>

//                 {/* Meta info */}
//                 <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
//                   <span>Applied: {new Date(volunteer.createdAt).toLocaleDateString()}</span>
//                   <span className="capitalize">Experience: {volunteer.experienceLevel}</span>
//                 </div>

//                 {/* Skills */}
//                 <div className="mb-3">
//                   <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
//                   <div className="flex flex-wrap gap-2">
//                     {volunteer.skills.map((skill) => (
//                       <span
//                         key={skill}
//                         className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
//                       >
//                         {skill}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Bio - Collapsible */}
//                 {volunteer.bio && (
//                   <div className="mt-2">
//                     <button
//                       onClick={() => setExpandedId(expandedId === volunteer._id ? null : volunteer._id)}
//                       className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
//                     >
//                       {expandedId === volunteer._id ? '▼ Hide Bio' : '▶ Show Bio'}
//                     </button>
//                     {expandedId === volunteer._id && (
//                       <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
//                         {volunteer.bio}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-2 ml-4">
//                 <button
//                   onClick={() => {
//                     setProcessingId(volunteer._id);
//                     onApprove(volunteer._id).finally(() => setProcessingId(null));
//                   }}
//                   disabled={processingId === volunteer._id}
//                   className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
//                 >
//                   {processingId === volunteer._id ? 'Processing...' : '✓ Approve'}
//                 </button>
//                 <button
//                   onClick={() => {
//                     setProcessingId(volunteer._id);
//                     onReject(volunteer._id).finally(() => setProcessingId(null));
//                   }}
//                   disabled={processingId === volunteer._id}
//                   className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
//                 >
//                   {processingId === volunteer._id ? 'Processing...' : '✗ Reject'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }


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
  onReject: (id: string) => Promise<void>
}

export default function PendingVolunteersSection({
  pendingVolunteers,
  loading,
  onApprove,
  onReject,
}: Props) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
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
      await onReject(rejectModalId)
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

  // Loading state
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

  // Koi pending nahi
  if (pendingVolunteers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✅</span>
          <h2 className="text-lg font-semibold text-gray-800">Pending Volunteer Approvals</h2>
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50">
          <div className="flex items-center gap-3">
            <span className="text-xl">⏳</span>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Pending Volunteer Approvals</h2>
              <p className="text-xs text-gray-500 mt-0.5">Review and approve or reject volunteer applications</p>
            </div>
          </div>
          <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {pendingVolunteers.length} Pending
          </span>
        </div>

        {/* Volunteer Cards */}
        <div className="divide-y divide-gray-100">
          {pendingVolunteers.map((volunteer) => {
            const isExpanded = expandedId === volunteer._id
            const isProcessing = processingId === volunteer._id

            return (
              <div key={volunteer._id} className="p-5">
                {/* Top Row */}
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {volunteer.avatar ? (
                      <img
                        src={volunteer.avatar}
                        alt={volunteer.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
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
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
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

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : volunteer._id)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {isExpanded ? '▲ Less' : '▼ More'}
                    </button>
                    <button
                      onClick={() => setRejectModalId(volunteer._id)}
                      disabled={isProcessing}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✕ Reject
                    </button>
                    <button
                      onClick={() => handleApprove(volunteer._id)}
                      disabled={isProcessing}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
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

                {/* Skills Row */}
                {volunteer.skills && volunteer.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {volunteer.skills.slice(0, isExpanded ? undefined : 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {!isExpanded && volunteer.skills.length > 4 && (
                      <span className="text-xs text-gray-400 px-1">
                        +{volunteer.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Expanded Bio */}
                {isExpanded && volunteer.bio && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 mb-1">Bio / About</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{volunteer.bio}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Reject Reason Modal */}
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
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={processingId === rejectModalId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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