'use client'

import React from 'react'
import SearchBox from '@/components/common/SearchBox'

type UserRole = 'citizen' | 'volunteer' | 'admin'

interface UserFiltersProps {
  searchTerm: string
  roleFilter: UserRole | ''
  onSearchChange: (value: string) => void
  onRoleFilterChange: (role: UserRole | '') => void
  onClearFilters: () => void
}

export default function UserFilters({
  searchTerm,
  roleFilter,
  onSearchChange,
  onRoleFilterChange,
  onClearFilters
}: UserFiltersProps) {
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    onClearFilters()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
        <div>
          <label className="block text-black text-sm font-medium text-gray-700 mb-2">Search Users</label>
          <SearchBox
            onSearch={onSearchChange}
            placeholder="Search by name or email..."
            className='text-black'
            value={searchTerm}
            onChange={onSearchChange}
            aria-label="Search users"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value as UserRole | '')}
            className="w-full border cursor-pointer text-black border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            aria-label="Filter users by role"
          >
            <option value="">All Roles</option>
            <option value="citizen">Citizen</option>
            <option value="volunteer">Volunteer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleClear}
            className="w-full bg-gray-600 cursor-pointer text-black text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
            aria-label="Clear all filters"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )
}