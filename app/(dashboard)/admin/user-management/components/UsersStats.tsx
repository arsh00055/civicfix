// 'use client'

// import React from 'react'
// import type { User } from '@/types';

// interface UserStatsProps {
//   users: User[];
//   pendingVolunteersCount?: number; // 👈 NEW
// }

// export default function UserStats({ users }: UserStatsProps) {
//   const stats = [
//     {
//       label: 'Total Users',
//       value: users.length,
//       color: 'text-gray-900',
//       borderColor: 'border-gray-200'
//     },
//     {
//       label: 'Citizens',
//       value: users.filter(u => u.role === 'citizen').length,
//       color: 'text-blue-600',
//       borderColor: 'border-blue-200'
//     },
//     {
//       label: 'Volunteers',
//       value: users.filter(u => u.role === 'volunteer').length,
//       color: 'text-green-600',
//       borderColor: 'border-green-200'
//     },
//     {
//       label: 'Admins',
//       value: users.filter(u => u.role === 'admin').length,
//       color: 'text-purple-600',
//       borderColor: 'border-purple-200'
//     }
//   ]

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//       {stats.map((stat, index) => (
//         <div key={index} className={`bg-white rounded-lg p-4 text-center border ${stat.borderColor}`}>
//           <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
//           <div className={`text-sm ${stat.color}`}>{stat.label}</div>
//         </div>
//       ))}
//     </div>
//   )
// }


'use client'

import React from 'react'
import type { User } from '@/types';

interface UserStatsProps {
  users: User[];
  pendingVolunteersCount?: number; // 👈 Optional prop for pending count
}

export default function UserStats({ users, pendingVolunteersCount = 0 }: UserStatsProps) {
  const stats = [
    {
      label: 'Total Users',
      value: users.length,
      color: 'text-gray-900',
      borderColor: 'border-gray-200',
      bgColor: 'bg-white'
    },
    {
      label: 'Citizens',
      value: users.filter(u => u.role === 'citizen').length,
      color: 'text-blue-600',
      borderColor: 'border-blue-200',
      bgColor: 'bg-white'
    },
    {
      label: 'Volunteers',
      value: users.filter(u => u.role === 'volunteer').length,
      color: 'text-green-600',
      borderColor: 'border-green-200',
      bgColor: 'bg-white'
    },
    {
      label: 'Admins',
      value: users.filter(u => u.role === 'admin').length,
      color: 'text-purple-600',
      borderColor: 'border-purple-200',
      bgColor: 'bg-white'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-lg p-4 text-center border ${stat.borderColor}`}>
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          <div className={`text-sm ${stat.color}`}>{stat.label}</div>
        </div>
      ))}
      
      {/* 👇 NEW: Pending Volunteers Stat Card */}
      <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
        <div className="text-2xl font-bold text-yellow-800">
          {pendingVolunteersCount}
        </div>
        <div className="text-sm text-yellow-700">
          Pending Approvals
        </div>
        {pendingVolunteersCount > 0 && (
          <div className="mt-1 text-xs text-yellow-600">
            ⏳ Awaiting review
          </div>
        )}
      </div>
    </div>
  )
}