// // 'use client'

// // import React from 'react'
// // import Image from 'next/image'
// // import { EnvelopeIcon, UserCircleIcon, UsersIcon } from '@/components/UI/icons'
// // import type { User } from '@/types'

// // type UserRole = 'citizen' | 'volunteer' | 'admin'

// // interface UsersTableProps {
// //   users: User[]
// //   updatingUser: string | null
// //   onUpdateRole: (userId: string, newRole: UserRole) => void
// //   onDeleteUser: (userId: string) => void
// // }

// // export default function UsersTable({
// //   users,
// //   updatingUser,
// //   onUpdateRole,
// //   onDeleteUser
// // }: UsersTableProps) {
// //   const getRoleColor = (role: UserRole) => {
// //     switch (role) {
// //       case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200'
// //       case 'volunteer': return 'bg-green-100 text-green-800 border-green-200'
// //       case 'citizen': return 'bg-blue-100 text-blue-800 border-blue-200'
// //       default: return 'bg-gray-100 text-gray-800 border-gray-200'
// //     }
// //   }

// //   const handleDeleteUser = (userId: string) => {
// //     onDeleteUser(userId)
// //   }

// //   if (users.length === 0) {
// //     return (
// //       <div className="text-center py-12">
// //         <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
// //         <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
// //         <p className="text-gray-600">
// //           No users in the system yet.
// //         </p>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
// //       <div className="overflow-x-auto">
// //         <table className="min-w-full divide-y divide-gray-200">
// //           <thead className="bg-gray-50">
// //             <tr>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 User
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Email
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Role
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Joined
// //               </th>
// //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                 Actions
// //               </th>
// //             </tr>
// //           </thead>
// //           <tbody className="bg-white divide-y divide-gray-200">
// //             {users.map((user) => (
// //               <tr key={user.id} className="hover:bg-gray-50">
// //                 <td className="px-6 py-4 whitespace-nowrap">
// //                   <div className="flex items-center">
// //                     <div className="flex-shrink-0 h-10 w-10">
// //                       {user.avatar ? (
// //                         <img
// //                           src={user.avatar}
// //                           alt={user.name}
// //                           width={40}
// //                           height={40}
// //                           className="h-10 w-10 rounded-full object-cover"
// //                         />
// //                       ) : (
// //                         <UserCircleIcon className="h-10 w-10 text-gray-400" aria-hidden="true" />
// //                       )}
// //                     </div>
// //                     <div className="ml-4">
// //                       <div className="text-sm font-medium text-gray-900">
// //                         {user.name}
// //                       </div>
// //                       <div className="text-sm text-gray-500">
// //                         ID: {user.id.slice(0, 8)}...
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap">
// //                   <div className="flex items-center text-sm text-gray-900">
// //                     <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" aria-hidden="true" />
// //                     {user.email}
// //                   </div>
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap">
// //                 <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getRoleColor(user.role as UserRole)}`}>
// //                     {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
// //                 </span>
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
// //                   {new Date(user.createdAt).toLocaleDateString()}
// //                 </td>
// //                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
// //                   <button
// //                     onClick={() => handleDeleteUser(user.id)}
// //                     className="text-red-600 hover:text-red-900 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded px-2 py-1"
// //                     aria-label={`Delete user ${user.name}`}
// //                   >
// //                     Delete
// //                   </button>
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   )
// // }


// 'use client'

// import React from 'react'
// import { EnvelopeIcon, UserCircleIcon, UsersIcon } from '@/components/UI/icons'
// import type { User } from '@/types'

// type UserRole = 'citizen' | 'volunteer' | 'admin'

// interface UsersTableProps {
//   users: User[]
//   updatingUser: string | null
//   onUpdateRole: (userId: string, newRole: UserRole) => void
//   onToggleActive: (userId: string, currentStatus: boolean) => void
// }

// export default function UsersTable({
//   users,
//   updatingUser,
//   onUpdateRole,
//   onToggleActive
// }: UsersTableProps) {
//   const getRoleColor = (role: UserRole) => {
//     switch (role) {
//       case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200'
//       case 'volunteer': return 'bg-green-100 text-green-800 border-green-200'
//       case 'citizen': return 'bg-blue-100 text-blue-800 border-blue-200'
//       default: return 'bg-gray-100 text-gray-800 border-gray-200'
//     }
//   }

//   if (users.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
//         <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
//         <p className="text-gray-600">No users in the system yet.</p>
//       </div>
//     )
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 User
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Email
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Role
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Joined
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {users.map((user) => {
//               const isActive = (user as any).isActive !== false // default true if field missing
//               return (
//                 <tr key={user.id} className={`hover:bg-gray-50 ${!isActive ? 'opacity-60 bg-gray-50' : ''}`}>

//                   {/* User */}
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="flex-shrink-0 h-10 w-10">
//                         {user.avatar ? (
//                           <img
//                             src={user.avatar}
//                             alt={user.name}
//                             width={40}
//                             height={40}
//                             className="h-10 w-10 rounded-full object-cover"
//                           />
//                         ) : (
//                           <UserCircleIcon className="h-10 w-10 text-gray-400" aria-hidden="true" />
//                         )}
//                       </div>
//                       <div className="ml-4">
//                         <div className="text-sm font-medium text-gray-900">{user.name}</div>
//                         <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
//                       </div>
//                     </div>
//                   </td>

//                   {/* Email */}
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center text-sm text-gray-900">
//                       <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" aria-hidden="true" />
//                       {user.email}
//                     </div>
//                   </td>

//                   {/* Role */}
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getRoleColor(user.role as UserRole)}`}>
//                       {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
//                     </span>
//                   </td>

//                   {/* Status Badge */}
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
//                       isActive
//                         ? 'bg-green-100 text-green-800 border-green-200'
//                         : 'bg-red-100 text-red-800 border-red-200'
//                     }`}>
//                       {isActive ? 'Active' : 'Deactivated'}
//                     </span>
//                   </td>

//                   {/* Joined */}
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {new Date(user.createdAt).toLocaleDateString()}
//                   </td>

//                   {/* Actions */}
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <button
//                       onClick={() => onToggleActive(user.id, isActive)}
//                       disabled={updatingUser === user.id}
//                       aria-label={`${isActive ? 'Deactivate' : 'Activate'} user ${user.name}`}
//                       className={`text-sm px-3 py-1 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed border ${
//                         isActive
//                           ? 'text-red-600 border-red-300 hover:bg-red-600 hover:text-white focus:ring-red-500'
//                           : 'text-green-600 border-green-300 hover:bg-green-600 hover:text-white focus:ring-green-500'
//                       }`}
//                     >
//                       {updatingUser === user.id
//                         ? 'Updating...'
//                         : isActive ? 'Deactivate' : 'Activate'}
//                     </button>
//                   </td>

//                 </tr>
//               )
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }


'use client'

import React from 'react'
import { EnvelopeIcon, UserCircleIcon, UsersIcon } from '@/components/UI/icons'
import type { User } from '@/types'

type UserRole = 'citizen' | 'volunteer' | 'admin'

interface UsersTableProps {
  users: User[]
  updatingUser: string | null
  onUpdateRole: (userId: string, newRole: UserRole) => void
  onToggleActive: (userId: string, currentStatus: boolean) => void
}

export default function UsersTable({
  users,
  updatingUser,
  onUpdateRole,
  onToggleActive
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
        <p className="text-gray-600">No users in the system yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              const isActive = (user as any).isActive !== false
              return (
                <tr key={user.id} className={`hover:bg-gray-50 ${!isActive ? 'opacity-60 bg-gray-50' : ''}`}>

                  {/* User */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon className="h-10 w-10 text-gray-400" aria-hidden="true" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" aria-hidden="true" />
                      {user.email}
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getRoleColor(user.role as UserRole)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                      isActive
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onToggleActive(user.id, isActive)}
                      disabled={updatingUser === user.id}
                      aria-label={`${isActive ? 'Deactivate' : 'Activate'} user ${user.name}`}
                      className={`text-sm px-3 py-1 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed border ${
                        isActive
                          ? 'text-red-600 border-red-300 hover:bg-red-600 hover:text-white focus:ring-red-500'
                          : 'text-green-600 border-green-300 hover:bg-green-600 hover:text-white focus:ring-green-500'
                      }`}
                    >
                      {updatingUser === user.id
                        ? 'Updating...'
                        : isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>

                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}