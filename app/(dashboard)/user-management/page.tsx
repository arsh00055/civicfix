'use client'

import { useState, useEffect } from 'react'
import apiClient from '../../../lib/services/api/client'
import Error from '../../error'
import UserManagementHeader from '../admin/user-management/components/UserManagementHeader'
import UserFilters from '../admin/user-management/components/UserFilters'
import UsersTable from '../admin/user-management/components/UsersTable'
import UserStats from '../admin/user-management/components/UsersStats'
import { User } from '@/types'

type UserRole = 'citizen' | 'volunteer' | 'admin'

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
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

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      return
    }

    try {
      await apiClient.delete(`/admin/users/${userId}`)
      setUsers(prev => prev.filter(user => user.id !== userId))
    } catch (err: any) {
      console.error('Failed to delete user:', err)
      setError(err.message || 'Failed to delete user. Please try again.')
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
    return null
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

        <UserStats users={users} />

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