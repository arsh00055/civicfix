'use client'

import { User } from '@/types/auth.types'

interface Props {
  users: User[]
  pendingVolunteersCount?: number
}

export default function UserStats({ users, pendingVolunteersCount = 0 }: Props) {
  const totalUsers = users.length
  const citizens = users.filter((u) => u.role === 'citizen').length
  const volunteers = users.filter((u) => u.role === 'volunteer').length
  const admins = users.filter((u) => u.role === 'admin').length

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: '👥',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-700',
      valueColor: 'text-blue-900',
    },
    {
      label: 'Citizens',
      value: citizens,
      icon: '🏘️',
      bg: 'bg-gray-50',
      border: 'border-gray-100',
      text: 'text-gray-600',
      valueColor: 'text-gray-900',
    },
    {
      label: 'Volunteers',
      value: volunteers,
      icon: '🙋',
      bg: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-700',
      valueColor: 'text-green-900',
    },
    {
      label: 'Admins',
      value: admins,
      icon: '🛡️',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      text: 'text-purple-700',
      valueColor: 'text-purple-900',
    },
    {
      label: 'Pending Approvals',
      value: pendingVolunteersCount,
      icon: '⏳',
      bg: pendingVolunteersCount > 0 ? 'bg-amber-50' : 'bg-gray-50',
      border: pendingVolunteersCount > 0 ? 'border-amber-200' : 'border-gray-100',
      text: pendingVolunteersCount > 0 ? 'text-amber-700' : 'text-gray-500',
      valueColor: pendingVolunteersCount > 0 ? 'text-amber-900' : 'text-gray-700',
      badge: pendingVolunteersCount > 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bg} border ${stat.border} rounded-xl p-4 relative overflow-hidden`}
        >
          {/* Pending badge pulse */}
          {stat.badge && (
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
          )}
          <div className="text-xl mb-2">{stat.icon}</div>
          <div className={`text-2xl font-bold ${stat.valueColor}`}>{stat.value}</div>
          <div className={`text-xs font-medium mt-0.5 ${stat.text}`}>{stat.label}</div>
        </div>
      ))}
    </div>
  )
}