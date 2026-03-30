// 'use client'

// import { useState, useEffect } from 'react'
// import apiClient from '@/lib/services/api/client'
// import Error from '@/app/error'
// import UserManagementHeader from './components/UserManagementHeader'
// import UserFilters from './components/UserFilters'
// import UsersTable from './components/UsersTable'
// import UserStats from './components/UsersStats'
// import { User } from '@/types/auth.types'

// type UserRole = 'citizen' | 'volunteer' | 'admin'

// export default function UserManagementPage() {
//   const [users, setUsers] = useState<User[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
//   const [updatingUser, setUpdatingUser] = useState<string | null>(null)

//   useEffect(() => {
//     fetchUsers()
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

//   const deleteUser = async (userId: string) => {
//     if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
//       return
//     }

//     try {
//       await apiClient.delete(`/admin/users/${userId}`)
//       setUsers(prev => prev.filter(user => user.id !== userId))
//     } catch (err: any) {
//       console.error('Failed to delete user:', err)
//       setError(err.message || 'Failed to delete user. Please try again.')
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
//     return null
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
//                   className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
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

//         <UserStats users={users} />

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
//           onDeleteUser={deleteUser}
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
import PendingVolunteersSection from './components/PendingVolunteersSection'// 👈 NEW COMPONENT
import { User } from '@/types/auth.types'

type UserRole = 'citizen' | 'volunteer' | 'admin'

// 👇 NEW: Interface for pending volunteer
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
  const [pendingVolunteers, setPendingVolunteers] = useState<PendingVolunteer[]>([]) // 👈 NEW
  const [loading, setLoading] = useState(true)
  const [loadingPending, setLoadingPending] = useState(true) // 👈 NEW
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchPendingVolunteers() // 👈 NEW: Fetch pending volunteers
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.get('/api/admin/users')
      setUsers(response.data)
    } catch (err: any) {
      console.error('Failed to fetch users:', err)
      setError(err.message || 'Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // 👇 NEW: Fetch pending volunteers
  const fetchPendingVolunteers = async () => {
    try {
      setLoadingPending(true)
      const response = await apiClient.get('/api/admin/volunteers/pending')
      setPendingVolunteers(response.data.data || [])
    } catch (err: any) {
      console.error('Failed to fetch pending volunteers:', err)
      // Don't show main error for pending volunteers, just log
    } finally {
      setLoadingPending(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      setUpdatingUser(userId)
      
      await apiClient.patch(`/api/admin/users/${userId}/role`, { role: newRole })
      
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

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      return
    }

    try {
      await apiClient.delete(`/api/admin/users/${userId}`)
      setUsers(prev => prev.filter(user => user.id !== userId))
    } catch (err: any) {
      console.error('Failed to delete user:', err)
      setError(err.message || 'Failed to delete user. Please try again.')
    }
  }

  // 👇 NEW: Handle approve volunteer
  const handleApproveVolunteer = async (volunteerId: string) => {
    try {
      await apiClient.post(`/api/admin/volunteers/${volunteerId}/approve`)
      // Remove from pending list
      setPendingVolunteers(prev => prev.filter(v => v._id !== volunteerId))
      // Refresh users list to include new approved volunteer
      fetchUsers()
      alert('✅ Volunteer approved successfully!')
    } catch (err: any) {
      console.error('Failed to approve volunteer:', err)
      alert(err.response?.data?.message || 'Failed to approve volunteer. Please try again.')
    }
  }

  // 👇 NEW: Handle reject volunteer
  const handleRejectVolunteer = async (volunteerId: string) => {
    const reason = prompt('Please enter reason for rejection (optional):')
    
    try {
      await apiClient.post(`/api/admin/volunteers/${volunteerId}/reject`, { reason: reason || 'No reason provided' })
      // Remove from pending list
      setPendingVolunteers(prev => prev.filter(v => v._id !== volunteerId))
      alert('❌ Volunteer rejected successfully!')
    } catch (err: any) {
      console.error('Failed to reject volunteer:', err)
      alert(err.response?.data?.message || 'Failed to reject volunteer. Please try again.')
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setRoleFilter('')
  }

  const handleRetry = () => {
    fetchUsers()
    fetchPendingVolunteers() // 👈 Also retry pending volunteers
  }

  const handleDismissError = () => {
    setError(null)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

        {/* 👇 NEW: Pending Volunteers Section */}
        <PendingVolunteersSection
          pendingVolunteers={pendingVolunteers}
          loading={loadingPending}
          onApprove={handleApproveVolunteer}
          onReject={handleRejectVolunteer}
        />

<UserStats 
  users={users} 
  pendingVolunteersCount={pendingVolunteers.length}  // 👈 Add this
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
          onDeleteUser={deleteUser}
        />
      </div>
    </div>
  )
}