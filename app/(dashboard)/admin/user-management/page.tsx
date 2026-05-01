'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  _id: string; name: string; email: string; skills: string[];
  experienceLevel: string; phone?: string; bio?: string; createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers]                         = useState<User[]>([])
  const [pendingVolunteers, setPendingVolunteers] = useState<PendingVolunteer[]>([])
  const [loading, setLoading]                     = useState(true)
  const [loadingPending, setLoadingPending]       = useState(true)
  const [error, setError]                         = useState<string | null>(null)
  const [searchTerm, setSearchTerm]               = useState('')
  const [roleFilter, setRoleFilter]               = useState<UserRole | ''>('')
  const [updatingUser, setUpdatingUser]           = useState<string | null>(null)

  // Deactivate modal state
  const [deactivateModalUserId, setDeactivateModalUserId] = useState<string | null>(null)
  const [deactivateReason, setDeactivateReason] = useState('')
  const [deactivating, setDeactivating] = useState(false)

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

  const updateUserRole = useCallback(async (userId: string, newRole: UserRole) => {
    try {
      setUpdatingUser(userId)
      await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole })
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (err: any) {
      setError(err.message || 'Failed to update user role. Please try again.')
    } finally {
      setUpdatingUser(null)
    }
  }, [])

  const toggleUserActive = useCallback(async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus

    let reason = ''
    if (!newStatus) {
      // Deactivate — custom modal kholo
      setDeactivateModalUserId(userId)
      setDeactivateReason('')
      return
    }

    // Activate — seedha confirm toast
    toast.warning('Activate this user?', {
      description: 'The user will be able to log in again. A notification email will be sent.',
      duration: 5000,
      action: {
        label: 'Activate',
        onClick: async () => {
          try {
            setUpdatingUser(userId)
            if (newStatus) {
              await apiClient.patch(`/admin/users/${userId}/activate`)
            } else {
              await apiClient.patch(`/admin/users/${userId}/deactivate`, { reason })
            }
            setUsers(prev => prev.map(u =>
              u.id === userId ? { ...u, isActive: true } as any : u
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
            toast.error('Action failed', {
              description: err.response?.data?.message || 'Please try again.',
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
  }, [])

  const handleApproveVolunteer = useCallback(async (volunteerId: string) => {
    try {
      await apiClient.post(`/admin/volunteers/${volunteerId}/approve`)
      setPendingVolunteers(prev => prev.filter(v => v._id !== volunteerId))
      fetchUsers()
      toast.success('Volunteer approved successfully!')
    } catch (err: any) {
      console.error('Failed to approve volunteer:', err)
      toast.error(err.response?.data?.message || 'Failed to approve volunteer. Please try again.')
    }
  }, [])

  const handleRejectVolunteer = useCallback(async (volunteerId: string) => {
    const reason = prompt('Please enter reason for rejection (optional):')
    try {
      await apiClient.post(`/admin/volunteers/${volunteerId}/reject`, {
        reason: reason || 'No reason provided',
      })
      setPendingVolunteers(prev => prev.filter(v => v._id !== volunteerId))
      toast.success('Volunteer rejected successfully.')
    } catch (err: any) {
      console.error('Failed to reject volunteer:', err)
      toast.error(err.response?.data?.message || 'Failed to reject volunteer. Please try again.')
    }
  }, [])

  const handleRetry = useCallback(() => {
    fetchUsers()
    fetchPendingVolunteers()
  }, [])

  const handleDismissError = useCallback(() => setError(null), [])
  const handleSearch       = useCallback((term: string) => setSearchTerm(term), [])
  const handleClearFilters = useCallback(() => { setSearchTerm(''); setRoleFilter('') }, [])

  const filteredUsers = useMemo(() => {
    if (!searchTerm && !roleFilter) return users

    const lowerSearch = searchTerm.toLowerCase() // compute once, not per user
    return users.filter(user => {
      const matchesSearch =
        !searchTerm ||
        user.name.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch)
      const matchesRole = !roleFilter || user.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, roleFilter])

  if (loading && !users.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error && !users.length) {
    return (
      <Error
        error={error as unknown as Error & { digest?: string | undefined }}
        reset={() => {}}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <UserManagementHeader onRefresh={handleRetry} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <p className="text-red-800 font-medium flex-1">{error}</p>
              <div className="flex space-x-2 ml-4">
                <button onClick={handleRetry} className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">Retry</button>
                <button onClick={() => setError(null)} className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300">Dismiss</button>
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

        <UserStats users={users} pendingVolunteersCount={pendingVolunteers.length} />

        <UserFilters
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          onSearchChange={setSearchTerm}
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

      {/* Deactivate Reason Modal */}
      {deactivateModalUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Deactivate User</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for deactivation. The user will be notified via email.
            </p>
            <textarea
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
              placeholder="e.g. Violation of community guidelines, suspicious activity..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setDeactivateModalUserId(null)
                  setDeactivateReason('')
                }}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeactivateModalUserId(null)
                  setDeactivateReason('')
                }}
                disabled={deactivating}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deactivating ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  'Confirm Deactivate'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}