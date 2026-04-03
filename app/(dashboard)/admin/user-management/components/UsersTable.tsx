'use client'

import React from 'react'
import { EnvelopeIcon, UserCircleIcon, UsersIcon } from '@/components/UI/icons'
import type { User } from '@/types'

type UserRole = 'citizen' | 'volunteer' | 'admin'

interface UsersTableProps {
  users: User[]
  updatingUser: string | null
  onUpdateRole: (userId: string, newRole: UserRole) => void
  onDeleteUser: (userId: string) => void
}

export default function UsersTable({
  users,
  updatingUser,
  onUpdateRole,
  onDeleteUser
}: UsersTableProps) {
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'volunteer': return 'bg-green-100 text-green-800 border-green-200'
      case 'citizen': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-600">
          No users in the system yet.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <UserCircleIcon className="h-10 w-10 text-gray-400" aria-hidden="true" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {user.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" aria-hidden="true" />
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <select
                      value={user.role}
                      onChange={(e) => onUpdateRole(user.id, e.target.value as UserRole)}
                      disabled={updatingUser === user.id}
                      className={`text-xs font-medium px-2 py-1 rounded-full border ${getRoleColor(user.role)} focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-transparent cursor-pointer`}
                      aria-label={`Change role for ${user.name}`}
                    >
                      <option value="citizen">Citizen</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="admin">Admin</option>
                    </select>
                    {updatingUser === user.id && (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 ml-2" aria-hidden="true"></div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded px-2 py-1 cursor-pointer"
                    aria-label={`Delete user ${user.name}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}