// // 'use client'

// // import { useState, useEffect } from 'react'
// // import apiClient from '@/lib/services/api/client'
// // import { toast } from 'sonner'

// // interface Contact {
// //   _id: string
// //   name: string
// //   email: string
// //   subject: string
// //   message: string
// //   status: 'open' | 'in-progress' | 'resolved'
// //   createdAt: string
// // }

// // export default function SupportPage() {
// //   const [contacts, setContacts] = useState<Contact[]>([])
// //   const [loading, setLoading] = useState(true)
// //   const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all')

// //   useEffect(() => {
// //     fetchContacts()
// //   }, [])

// //   const fetchContacts = async () => {
// //     try {
// //       setLoading(true)
// //       const res = await apiClient.get('/admin/support')
// //       setContacts(res.data.data || [])
// //     } catch (err) {
// //       toast.error('Failed to load messages')
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   const updateStatus = async (id: string, status: string) => {
// //     try {
// //       await apiClient.patch('/admin/support', { id, status })
// //       setContacts(prev => prev.map(c =>
// //         c._id === id ? { ...c, status: status as any } : c
// //       ))
// //       toast.success('Status updated!')
// //     } catch {
// //       toast.error('Failed to update status')
// //     }
// //   }

// //   const filteredContacts = contacts.filter(c =>
// //     filter === 'all' ? true : c.status === filter
// //   )

// //   const getStatusColor = (status: string) => {
// //     if (status === 'open') return 'bg-yellow-100 text-yellow-700'
// //     if (status === 'in-progress') return 'bg-blue-100 text-blue-700'
// //     return 'bg-green-100 text-green-700'
// //   }

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
// //           <p className="mt-4 text-gray-600">Loading messages...</p>
// //         </div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50 pb-8">
// //       <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">

// //         {/* Header */}
// //         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
// //           <div>
// //             <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Support Messages</h1>
// //             <p className="text-sm text-gray-500 mt-1">Messages sent via Contact Us form</p>
// //           </div>
// //           <button
// //             onClick={fetchContacts}
// //             className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
// //           >
// //             🔄 Refresh
// //           </button>
// //         </div>

// //         {/* Filter Tabs */}
// //         <div className="flex flex-wrap gap-2 mb-6">
// //           {(['all', 'open', 'in-progress', 'resolved'] as const).map(tab => (
// //             <button
// //               key={tab}
// //               onClick={() => setFilter(tab)}
// //               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
// //                 filter === tab
// //                   ? 'bg-purple-600 text-white'
// //                   : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
// //               }`}
// //             >
// //               {tab} {tab === 'all' ? `(${contacts.length})` : `(${contacts.filter(c => c.status === tab).length})`}
// //             </button>
// //           ))}
// //         </div>

// //         {/* Messages List */}
// //         {filteredContacts.length === 0 ? (
// //           <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
// //             <p className="text-4xl mb-3">📭</p>
// //             <p className="text-gray-500">No messages found</p>
// //           </div>
// //         ) : (
// //           <div className="space-y-4">
// //             {filteredContacts.map(contact => (
// //               <div key={contact._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                
// //                 {/* Top Row */}
// //                 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
// //                   <div>
// //                     <div className="flex items-center gap-2 flex-wrap">
// //                       <span className="font-semibold text-gray-900">{contact.name}</span>
// //                       <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(contact.status)}`}>
// //                         {contact.status}
// //                       </span>
// //                     </div>
// //                     <p className="text-xs text-gray-500 mt-0.5">{contact.email}</p>
// //                     <p className="text-xs text-gray-400 mt-0.5">
// //                       {new Date(contact.createdAt).toLocaleDateString('en-IN', {
// //                         day: 'numeric', month: 'short', year: 'numeric'
// //                       })}
// //                     </p>
// //                   </div>

// //                   {/* Status Update */}
// //                   <select
// //                     value={contact.status}
// //                     onChange={(e) => updateStatus(contact._id, e.target.value)}
// //                     className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
// //                   >
// //                     <option value="open">Open</option>
// //                     <option value="in-progress">In Progress</option>
// //                     <option value="resolved">Resolved</option>
// //                   </select>
// //                 </div>

// //                 {/* Subject */}
// //                 <p className="text-sm font-medium text-gray-700 mb-1">
// //                   📌 {contact.subject}
// //                 </p>

// //                 {/* Message */}
// //                 <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
// //                   {contact.message}
// //                 </p>

// //               </div>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   )
// // }


// 'use client'

// import { useState, useEffect } from 'react'
// import apiClient from '@/lib/services/api/client'
// import { toast } from 'sonner'

// interface Contact {
//   _id: string
//   name: string
//   email: string
//   subject: string
//   message: string
//   status: 'open' | 'in-progress' | 'resolved'
//   role?: string
//   createdAt: string
// }

// export default function SupportPage() {
//   const [contacts, setContacts] = useState<Contact[]>([])
//   const [loading, setLoading] = useState(true)
//   const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all')

//   useEffect(() => {
//     fetchContacts()
//   }, [])

//   const fetchContacts = async () => {
//     try {
//       setLoading(true)
//       const res = await apiClient.get('/admin/support')
//       setContacts(res.data.data || [])
//     } catch (err) {
//       toast.error('Failed to load messages')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const updateStatus = async (id: string, status: string) => {
//     try {
//       await apiClient.patch('/admin/support', { id, status })
//       setContacts(prev => prev.map(c =>
//         c._id === id ? { ...c, status: status as any } : c
//       ))
//       toast.success('Status updated!')
//     } catch {
//       toast.error('Failed to update status')
//     }
//   }

//   const filteredContacts = contacts.filter(c =>
//     filter === 'all' ? true : c.status === filter
//   )

//   const getStatusColor = (status: string) => {
//     if (status === 'open') return 'bg-yellow-100 text-yellow-700'
//     if (status === 'in-progress') return 'bg-blue-100 text-blue-700'
//     return 'bg-green-100 text-green-700'
//   }

//   const getRoleColor = (role?: string) => {
//     if (role === 'admin') return 'bg-purple-100 text-purple-700'
//     if (role === 'volunteer') return 'bg-green-100 text-green-700'
//     return 'bg-blue-100 text-blue-700'
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
//           <p className="mt-4 text-gray-600">Loading messages...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 pb-8">
//       <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">

//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
//           <div>
//             <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Support Messages</h1>
//             <p className="text-sm text-gray-500 mt-1">Messages sent via Contact Us form</p>
//           </div>
//           <button
//             onClick={fetchContacts}
//             className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
//           >
//             🔄 Refresh
//           </button>
//         </div>

//         {/* Filter Tabs */}
//         <div className="flex flex-wrap gap-2 mb-6">
//           {(['all', 'open', 'in-progress', 'resolved'] as const).map(tab => (
//             <button
//               key={tab}
//               onClick={() => setFilter(tab)}
//               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
//                 filter === tab
//                   ? 'bg-purple-600 text-white'
//                   : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
//               }`}
//             >
//               {tab} {tab === 'all' 
//                 ? `(${contacts.length})` 
//                 : `(${contacts.filter(c => c.status === tab).length})`
//               }
//             </button>
//           ))}
//         </div>

//         {/* Messages List */}
//         {filteredContacts.length === 0 ? (
//           <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
//             <p className="text-4xl mb-3">📭</p>
//             <p className="text-gray-500">No messages found</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredContacts.map(contact => (
//               <div key={contact._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">

//                 {/* Top Row — Name, Role, Status, Dropdown */}
//                 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
//                   <div>
//                     <div className="flex items-center gap-2 flex-wrap">
//                       <span className="font-semibold text-gray-900">{contact.name}</span>

//                       {/* Role Badge */}
//                       <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getRoleColor(contact.role)}`}>
//                         {contact.role || 'citizen'}
//                       </span>

//                       {/* Status Badge */}
//                       <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(contact.status)}`}>
//                         {contact.status}
//                       </span>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-0.5">{contact.email}</p>
//                     <p className="text-xs text-gray-400 mt-0.5">
//                       {new Date(contact.createdAt).toLocaleDateString('en-IN', {
//                         day: 'numeric', month: 'short', year: 'numeric'
//                       })}
//                     </p>
//                   </div>

//                   {/* Status Dropdown */}
//                   <select
//                     value={contact.status}
//                     onChange={(e) => updateStatus(contact._id, e.target.value)}
//                     className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
//                   >
//                     <option value="open">Open</option>
//                     <option value="in-progress">In Progress</option>
//                     <option value="resolved">Resolved</option>
//                   </select>
//                 </div>

//                 {/* Subject */}
//                 <p className="text-sm font-medium text-gray-700 mb-1">
//                   📌 {contact.subject}
//                 </p>

//                 {/* Message */}
//                 <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
//                   {contact.message}
//                 </p>

//                 {/* Reply Button */}
                
//                   <a href={`mailto:${contact.email}?subject=Re: ${contact.subject}&body=Hi ${contact.name},%0D%0A%0D%0AThank you for contacting CivicFix Support.%0D%0A%0D%0ARegards,%0D%0ACivicFix Support Team`}
//                   className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors mt-3"
//                 >
//                   📧 Reply via Email
//                 </a>

//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }


'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/services/api/client'
import { toast } from 'sonner'

interface Contact {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'open' | 'in-progress' | 'resolved'
  role?: string
  createdAt: string
}

export default function SupportPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all')

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/admin/support')
      setContacts(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch('/admin/support', { id, status })
      setContacts(prev => prev.map(c =>
        c._id === id ? { ...c, status: status as any } : c
      ))
      toast.success('Status updated!')
    } catch {
      toast.error('Failed to update status')
    }
  }

  // Open pehle, phir in-progress, phir resolved
  const sortedContacts = [...contacts].sort((a, b) => {
    const order = { open: 0, 'in-progress': 1, resolved: 2 }
    return order[a.status] - order[b.status]
  })

  const filteredContacts = sortedContacts.filter(c =>
    filter === 'all' ? true : c.status === filter
  )

  const getStatusColor = (status: string) => {
    if (status === 'open') return 'bg-yellow-100 text-yellow-700'
    if (status === 'in-progress') return 'bg-blue-100 text-blue-700'
    return 'bg-green-100 text-green-700'
  }

  const getRoleColor = (role?: string) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-700'
    if (role === 'volunteer') return 'bg-green-100 text-green-700'
    return 'bg-blue-100 text-blue-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Support Messages</h1>
            <p className="text-sm text-gray-500 mt-1">Messages sent via Contact Us form</p>
          </div>
          <button
            onClick={fetchContacts}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'open', 'in-progress', 'resolved'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab} {tab === 'all'
                ? `(${contacts.length})`
                : `(${contacts.filter(c => c.status === tab).length})`
              }
            </button>
          ))}
        </div>

        {/* Messages List */}
        {filteredContacts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500">No messages found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContacts.map(contact => (
              <div key={contact._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">

                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{contact.name}</span>

                      {/* Role Badge */}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getRoleColor(contact.role)}`}>
                        {contact.role || 'citizen'}
                      </span>

                      {/* Status Badge */}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(contact.status)}`}>
                        {contact.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{contact.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(contact.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Status Dropdown — resolved hone baad disable */}
                  <select
                    value={contact.status}
                    onChange={(e) => updateStatus(contact._id, e.target.value)}
                    disabled={contact.status === 'resolved'}
                    className={`text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                      contact.status === 'resolved'
                        ? 'opacity-50 cursor-not-allowed bg-gray-50'
                        : 'cursor-pointer'
                    }`}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                {/* Subject */}
                <p className="text-sm font-medium text-gray-700 mb-1">
                  📌 {contact.subject}
                </p>

                {/* Message */}
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {contact.message}
                </p>

                {/* Reply Button */}
                <a
                  href={`mailto:${contact.email}?subject=Re: ${contact.subject}&body=Hi ${contact.name},%0D%0A%0D%0AThank you for contacting CivicFix Support.%0D%0A%0D%0ARegards,%0D%0ACivicFix Support Team`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors mt-3"
                >
                  📧 Reply via Email
                </a>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}