// 'use client'

// import { useState, useEffect } from 'react'
// import apiClient from '@/lib/services/api/client'
// import Error from '@/app/error'
// import UserManagementHeader from './components/UserManagementHeader'
// import UserFilters from './components/UserFilters'
// import UsersTable from './components/UsersTable'
// import UserStats from './components/UsersStats'
// import PendingVolunteersSection from './components/PendingVolunteersSection'// 👈 NEW COMPONENT
// import { User } from '@/types/auth.types'
// import { toast } from 'sonner'

// type UserRole = 'citizen' | 'volunteer' | 'admin'

// // 👇 NEW: Interface for pending volunteer
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

// export default function UserManagementPage() {
//   const [users, setUsers] = useState<User[]>([])
//   const [pendingVolunteers, setPendingVolunteers] = useState<PendingVolunteer[]>([]) // 👈 NEW
//   const [loading, setLoading] = useState(true)
//   const [loadingPending, setLoadingPending] = useState(true) // 👈 NEW
//   const [error, setError] = useState<string | null>(null)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
//   const [updatingUser, setUpdatingUser] = useState<string | null>(null)

//   useEffect(() => {
//     fetchUsers()
//     fetchPendingVolunteers() // 👈 NEW: Fetch pending volunteers
//   }, [])

//   const fetchUsers = async () => {
//     try {
//       setLoading(true)
//       setError(null)
      
//       const response = await apiClient.get('/admin/users')
//       setUsers(response.data)
//     } catch (err: any) {
//       console.error('Failed to fetch users:', err)
//       setError(err.message || 'Failed to load users. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   // 👇 NEW: Fetch pending volunteers
//   const fetchPendingVolunteers = async () => {
//     try {
//       setLoadingPending(true)
//       const response = await apiClient.get('/admin/volunteers/pending')
//       setPendingVolunteers(response.data.data || [])
//     } catch (err: any) {
//       console.error('Failed to fetch pending volunteers:', err)
//       // Don't show main error for pending volunteers, just log
//     } finally {
//       setLoadingPending(false)
//     }
//   }

//   const updateUserRole = async (userId: string, newRole: UserRole) => {
//     try {
//       setUpdatingUser(userId)
      
//       await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole })
      
//       setUsers(prev => prev.map(user => 
//         user.id === userId ? { ...user, role: newRole } : user
//       ))
//     } catch (err: any) {
//       console.error('Failed to update user role:', err)
//       setError(err.message || 'Failed to update user role. Please try again.')
//     } finally {
//       setUpdatingUser(null)
//     }
//   }

//   const toggleUserActive = async (userId: string, currentStatus: boolean) => {
//     const newStatus = !currentStatus
//     toast.warning(`${newStatus ? 'Activate' : 'Deactivate'} this user?`, {
//       description: `User account will be ${newStatus ? 'activated' : 'deactivated'}.`,
//       duration: 5000,
//       action: {
//         label: newStatus ? 'Activate' : 'Deactivate',
//         onClick: async () => {
//           try {
//             setUpdatingUser(userId)
//             await apiClient.patch(`/admin/users/${userId}`, { isActive: newStatus })
//             setUsers(prev => prev.map(u =>
//               u.id === userId ? { ...u, isActive: newStatus } as any : u
//             ))
//             toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`)
//           } catch (err: any) {
//             toast.error('Action failed', { description: err.message || 'Please try again.' })
//           } finally {
//             setUpdatingUser(null)
//           }
//         },
//       },
//       cancel: { label: 'Cancel', onClick: () => {} },
//     })
//   }

//   // 👇 NEW: Handle approve volunteer
//   const handleApproveVolunteer = async (volunteerId: string) => {
//     try {
//       await apiClient.post(`/admin/volunteers/${volunteerId}/approve`)
//       // Remove from pending list
//       setPendingVolunteers(prev => prev.filter(v => v._id !== volunteerId))
//       // Refresh users list to include new approved volunteer
//       fetchUsers()
//       alert('✅ Volunteer approved successfully!')
//     } catch (err: any) {
//       console.error('Failed to approve volunteer:', err)
//       alert(err.response?.data?.message || 'Failed to approve volunteer. Please try again.')
//     }
//   }

//   // 👇 NEW: Handle reject volunteer
//   const handleRejectVolunteer = async (volunteerId: string) => {
//     const reason = prompt('Please enter reason for rejection (optional):')
    
//     try {
//       await apiClient.post(`/admin/volunteers/${volunteerId}/reject`, { reason: reason || 'No reason provided' })
//       // Remove from pending list
//       setPendingVolunteers(prev => prev.filter(v => v._id !== volunteerId))
//       alert('❌ Volunteer rejected successfully!')
//     } catch (err: any) {
//       console.error('Failed to reject volunteer:', err)
//       alert(err.response?.data?.message || 'Failed to reject volunteer. Please try again.')
//     }
//   }

  

//   const handleSearch = (term: string) => {
//     setSearchTerm(term)
//   }

//   const handleClearFilters = () => {
//     setSearchTerm('')
//     setRoleFilter('')
//   }

//   const handleRetry = () => {
//     fetchUsers()
//     fetchPendingVolunteers() // 👈 Also retry pending volunteers
//   }

//   const handleDismissError = () => {
//     setError(null)
//   }

//   const filteredUsers = users.filter(user => {
//     const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
//     const matchesRole = !roleFilter || user.role === roleFilter
//     return matchesSearch && matchesRole
//   })

//   if (loading && !users.length) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading users...</p>
//         </div>
//       </div>
//     )
//   }

//   if (error && !users.length) {
//     return (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />)
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 pb-8">
//       <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
//         <UserManagementHeader onRefresh={handleRetry} />

//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
//             <div className="flex items-start justify-between">
//               <div className="flex-1">
//                 <p className="text-red-800 font-medium">{error}</p>
//               </div>
//               <div className="flex space-x-2 ml-4">
//                 <button
//                   onClick={handleRetry}
//                   className="px-3 py-1 text-green-500 bg-red-600 text-white text-sm rounded hover:bg-red-700"
//                 >
//                   Retry
//                 </button>
//                 <button
//                   onClick={handleDismissError}
//                   className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
//                 >
//                   Dismiss
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         <PendingVolunteersSection
//           pendingVolunteers={pendingVolunteers}
//           loading={loadingPending}
//           onApprove={handleApproveVolunteer}
//           onReject={handleRejectVolunteer}
//         />

//         <UserStats 
//           users={users} 
//           pendingVolunteersCount={pendingVolunteers.length}
//         />

//         <UserFilters
//           searchTerm={searchTerm}
//           roleFilter={roleFilter}
//           onSearchChange={handleSearch}
//           onRoleFilterChange={setRoleFilter}
//           onClearFilters={handleClearFilters}
//         />

//         <UsersTable
//           users={filteredUsers}
//           updatingUser={updatingUser}
//           onUpdateRole={updateUserRole}
//           onToggleActive={toggleUserActive}
//         />
//       </div>
//     </div>
//   )
// }


'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/services/api/client'
import Error from '@/app/error'
import UserManagementHeader from './components/UserManagementHeader'
import UserFilters from './components/UserFilters'
import UsersTable from './components/UsersTable'
import UserStats from './components/UsersStats'
import PendingVolunteersSection from './components/PendingVolunteersSection'
import { User } from '@/types/auth.types'
import { toast } from 'sonner'

type UserRole = 'citizen' | 'volunteer' | 'admin'

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

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pendingVolunteers, setPendingVolunteers] = useState<PendingVolunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPending, setLoadingPending] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchPendingVolunteers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get('/admin/users')
      setUsers(response.data)
    } catch (err: any) {
      console.error('Failed to fetch users:', err)
      setError(err.message || 'Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingVolunteers = async () => {
    try {
      setLoadingPending(true)
      const response = await apiClient.get('/admin/volunteers/pending')
      setPendingVolunteers(response.data.data || [])
    } catch (err: any) {
      console.error('Failed to fetch pending volunteers:', err)
    } finally {
      setLoadingPending(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      setUpdatingUser(userId)
      await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole })
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (err: any) {
      console.error('Failed to update user role:', err)
      setError(err.message || 'Failed to update user role. Please try again.')
    } finally {
      setUpdatingUser(null)
    }
  }

  const toggleUserActive = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus

    // Deactivate karne time pehle reason lo
    let reason = ''
    if (!newStatus) {
      reason = window.prompt('Please enter the reason for deactivation:') || ''
      if (!reason.trim()) {
        toast.error('Reason is required to deactivate an account.')
        return
      }
    }

    toast.warning(`${newStatus ? 'Activate' : 'Deactivate'} this user?`, {
      description: newStatus
        ? 'The user will be able to log in again. A notification email will be sent.'
        : `Account will be deactivated. Reason: "${reason}". A notification email will be sent.`,
      duration: 5000,
      action: {
        label: newStatus ? 'Activate' : 'Deactivate',
        onClick: async () => {
          try {
            setUpdatingUser(userId)

            if (newStatus) {
              // ✅ activate/route.ts call
              await apiClient.patch(`/admin/users/${userId}/activate`)
            } else {
              // ✅ deactivate/route.ts call with reason
              await apiClient.patch(`/admin/users/${userId}/deactivate`, { reason })
            }

            setUsers(prev => prev.map(u =>
              u.id === userId ? { ...u, isActive: newStatus } as any : u
            ))

            toast.success(
              newStatus ? 'User activated successfully' : 'User deactivated successfully',
              {
                description: newStatus
                  ? 'The user can now log in. Notification email sent.'
                  : 'The user has been notified via email.',
                duration: 3000,
              }
            )
          } catch (err: any) {
            console.error('Failed to update user status:', err)
            toast.error('Action failed', {
              description: err.response?.data?.message || err.message || 'Please try again.',
              duration: 4000,
            })
          } finally {
            setUpdatingUser(null)
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => toast.info('Action cancelled', { duration: 2000 }),
      },
    })
  }

  const handleApproveVolunteer = async (volunteerId: string) => {
    try {
      await apiClient.post(`/admin/volunteers/${volunteerId}/approve`)
      setPendingVolunteers(prev => prev.filter(v => v._id !== volunteerId))
      fetchUsers()
      toast.success('Volunteer approved successfully!', {
        description: 'The volunteer has been notified via email',
        duration: 3000,
      })
    } catch (err: any) {
      console.error('Failed to approve volunteer:', err)
      alert(err.response?.data?.message || 'Failed to approve volunteer. Please try again.')
    }
  }

  const handleRejectVolunteer = async (volunteerId: string, reason: string) => {
    
    try {
      await apiClient.post(`/admin/volunteers/${volunteerId}/reject`, { reason: reason || 'No reason provided' })
      setPendingVolunteers(prev => prev.filter(v => v._id !== volunteerId))
      toast.success('Volunteer rejected successfully!', {
        description: 'The volunteer has been notified via email.',
        duration: 3000,
      })
    } catch (err: any) {
      console.error('Failed to reject volunteer:', err)
      alert(err.response?.data?.message || 'Failed to reject volunteer. Please try again.')
    }
  }

  const handleSearch = (term: string) => setSearchTerm(term)

  const handleClearFilters = () => {
    setSearchTerm('')
    setRoleFilter('')
  }

  const handleRetry = () => {
    fetchUsers()
    fetchPendingVolunteers()
  }

  const handleDismissError = () => setError(null)

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !roleFilter || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading && !users.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error && !users.length) {
    return (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <UserManagementHeader onRefresh={handleRetry} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Retry
                </button>
                <button
                  onClick={handleDismissError}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <PendingVolunteersSection
          pendingVolunteers={pendingVolunteers}
          loading={loadingPending}
          onApprove={handleApproveVolunteer}
          onReject={handleRejectVolunteer}
        />

        <UserStats
          users={users}
          pendingVolunteersCount={pendingVolunteers.length}
        />

        <UserFilters
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          onSearchChange={handleSearch}
          onRoleFilterChange={setRoleFilter}
          onClearFilters={handleClearFilters}
        />

        <UsersTable
          users={filteredUsers}
          updatingUser={updatingUser}
          onUpdateRole={updateUserRole}
          onToggleActive={toggleUserActive}
        />
      </div>
    </div>
  )
}