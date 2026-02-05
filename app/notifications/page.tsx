// // 'use client';

// // import React, { useState, useEffect } from 'react';
// // import { useRouter } from 'next/navigation';
// // import MainLayout from '@/components/layout/MainLayout';
// // import Loading from '@/app/loading'
// // import Error from '@/app/error'
// // import { BellIcon, CheckCircleIcon } from '@/components/UI/icons';
// // import { useAuth } from '@/features/auth/hooks/useAuth';
// // import { useNotifications } from '@/features/notifications/hooks/useNotifications'; // Import the hook

// // const NotificationsPage: React.FC = () => {
// //   const router = useRouter();
// //   const { user } = useAuth();
  
// //   // Use the hook instead of local state management
// //   const { 
// //     notifications,
// //     loading,
// //     error,
// //     unreadCount,
// //     markAsRead,
// //     markAllAsRead,
// //     deleteNotification,
// //     refetch,
// //     refresh,
// //     createTestNotification,
// //     requestPermission
// //   } = useNotifications();

// //   useEffect(() => {
// //     if (user) {
// //       // The hook automatically fetches on mount, but you can refetch if needed
// //       refetch();
// //     }
// //   }, [user, refetch]);

// //   const handleRetry = () => {
// //     refetch();
// //   };

// //   const handleMarkAsRead = async (notificationId: string) => {
// //     try {
// //       await markAsRead(notificationId);
// //     } catch (err) {
// //       console.error('Failed to mark as read:', err);
// //       // Optionally show a toast message here
// //     }
// //   };

// //   const handleMarkAllAsRead = async () => {
// //     try {
// //       await markAllAsRead();
// //     } catch (err) {
// //       console.error('Failed to mark all as read:', err);
// //     }
// //   };

// //   const handleDeleteNotification = async (notificationId: string) => {
// //     if (confirm('Are you sure you want to delete this notification?')) {
// //       try {
// //         await deleteNotification(notificationId);
// //       } catch (err) {
// //         console.error('Failed to delete notification:', err);
// //       }
// //     }
// //   };

// //   if (!user) {
// //     return (
// //       <MainLayout role={null}>
// //         <div className="container mx-auto px-4 py-8">
// //           <div className="max-w-4xl mx-auto text-center">
// //             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
// //               <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
// //               <p className="text-gray-600 mb-6">
// //                 You need to be logged in to view notifications.
// //               </p>
// //               <button
// //                 onClick={() => router.push('/login')}
// //                 className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
// //               >
// //                 Log In
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </MainLayout>
// //     );
// //   }

// //   return (
// //     <MainLayout role={user?.role || null}>
// //       <div className="container mx-auto px-4 py-8">
// //         <div className="max-w-4xl mx-auto">
// //           {/* Header */}
// //           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
// //             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// //               <div className="flex items-center space-x-4">
// //                 <div className="p-3 bg-blue-100 rounded-lg">
// //                   <BellIcon className="h-8 w-8 text-blue-600" />
// //                 </div>
// //                 <div>
// //                   <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
// //                   <p className="text-gray-600 mt-1">
// //                     {unreadCount > 0 
// //                       ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
// //                       : 'All caught up!'
// //                     }
// //                   </p>
// //                 </div>
// //               </div>
              
// //               <div className="flex flex-col sm:flex-row gap-2">
// //                 {unreadCount > 0 && (
// //                   <button
// //                     onClick={handleMarkAllAsRead}
// //                     disabled={loading}
// //                     className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
// //                   >
// //                     <CheckCircleIcon className="h-4 w-4" />
// //                     <span>Mark all as read</span>
// //                   </button>
// //                 )}
                
// //                 {/* Optional: Add test notification button for development */}
// //                 {process.env.NODE_ENV !== 'production' && (
// //                   <button
// //                     onClick={createTestNotification}
// //                     className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors"
// //                   >
// //                     <span>Create Test</span>
// //                   </button>
// //                 )}
// //               </div>
// //             </div>
// //           </div>

// //           {loading && notifications.length === 0 && (<Loading />)}

// //           {error && !loading && (
// //             <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
// //               <div className="text-center">
// //                 <p className="text-red-600 mb-4">{error}</p>
// //                 <button
// //                   onClick={handleRetry}
// //                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
// //                 >
// //                   Try Again
// //                 </button>
// //               </div>
// //             </div>
// //           )}

// //           {!loading && !error && notifications.length === 0 && (
// //             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
// //               <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
// //               <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
// //               <p className="text-gray-600 max-w-md mx-auto">
// //                 You're all caught up! We'll notify you when there's new activity.
// //               </p>
// //             </div>
// //           )}

// //           {/* Notifications List */}
// //           {!loading && !error && notifications.length > 0 && (
// //             <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
// //               <div className="divide-y divide-gray-200">
// //                 {notifications.map(notification => (
// //                   <div 
// //                     key={notification.id}
// //                     className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
// //                     onClick={() => handleMarkAsRead(notification.id)}
// //                   >
// //                     <div className="flex items-start space-x-3">
// //                       <div className="flex-shrink-0">
// //                         {!notification.read && (
// //                           <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
// //                         )}
// //                       </div>
// //                       <div className="flex-1">
// //                         <div className="flex justify-between items-start">
// //                           <h3 className="font-medium text-gray-900">{notification.title}</h3>
// //                           <button
// //                             onClick={(e) => {
// //                               e.stopPropagation();
// //                               handleDeleteNotification(notification.id);
// //                             }}
// //                             className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50"
// //                             title="Delete notification"
// //                           >
// //                             ×
// //                           </button>
// //                         </div>
// //                         <p className="text-gray-600 mt-1">{notification.message}</p>
// //                         <div className="flex items-center justify-between mt-2">
// //                           <p className="text-gray-400 text-sm">
// //                             {new Date(notification.timestamp).toLocaleDateString()} • {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// //                           </p>
// //                           {notification.type && (
// //                             <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
// //                               {notification.type.replace('_', ' ')}
// //                             </span>
// //                           )}
// //                         </div>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </MainLayout>
// //   );
// // };

// // export default NotificationsPage;


// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import MainLayout from '@/components/layout/MainLayout';
// import Loading from '@/app/loading'
// import Error from '@/app/error'
// import { BellIcon, CheckCircleIcon } from '@/components/UI/icons';
// import { useAuth } from '@/features/auth/hooks/useAuth';
// import { useNotifications } from '@/features/notifications/hooks/useNotifications';

// const NotificationsPage: React.FC = () => {
//   const router = useRouter();
//   const { user } = useAuth();
  
//   const { 
//     notifications,
//     loading,
//     error,
//     unreadCount,
//     markAsRead,
//     markAllAsRead,
//     deleteNotification,
//     refetch,
//     createTestNotification
//   } = useNotifications();

//   useEffect(() => {
//     if (user) {
//       refetch();
//     }
//   }, [user, refetch]);

//   const handleRetry = () => {
//     refetch();
//   };

//   const handleMarkAsRead = async (notificationId: string) => {
//     try {
//       await markAsRead(notificationId);
//     } catch (err) {
//       console.error('Failed to mark as read:', err);
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     try {
//       await markAllAsRead();
//     } catch (err) {
//       console.error('Failed to mark all as read:', err);
//     }
//   };

//   const handleDeleteNotification = async (notificationId: string) => {
//     if (confirm('Are you sure you want to delete this notification?')) {
//       try {
//         await deleteNotification(notificationId);
//       } catch (err) {
//         console.error('Failed to delete notification:', err);
//       }
//     }
//   };

//   if (!user) {
//     return (
//       <MainLayout role={null}>
//         <div className="min-h-screen bg-gray-50"> {/* Added background */}
//           <div className="container mx-auto px-4 py-8">
//             <div className="max-w-4xl mx-auto text-center">
//               <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
//                 <p className="text-gray-600 mb-6">
//                   You need to be logged in to view notifications.
//                 </p>
//                 <button
//                   onClick={() => router.push('/login')}
//                   className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Log In
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout role={user?.role || null}>
//       {/* Add a full height container with background */}
//       <div className="min-h-screen bg-gray-50">
//         <div className="container mx-auto px-4 py-8">
//           <div className="max-w-4xl mx-auto">
//             {/* Header */}
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                 <div className="flex items-center space-x-4">
//                   <div className="p-3 bg-blue-100 rounded-lg">
//                     <BellIcon className="h-8 w-8 text-blue-600" />
//                   </div>
//                   <div>
//                     <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
//                     <p className="text-gray-600 mt-1">
//                       {unreadCount > 0 
//                         ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
//                         : 'All caught up!'
//                       }
//                     </p>
//                   </div>
//                 </div>
                
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   {unreadCount > 0 && (
//                     <button
//                       onClick={handleMarkAllAsRead}
//                       disabled={loading}
//                       className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                       <CheckCircleIcon className="h-4 w-4" />
//                       <span>Mark all as read</span>
//                     </button>
//                   )}
                  
//                   {process.env.NODE_ENV !== 'production' && (
//                     <button
//                       onClick={createTestNotification}
//                       className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors"
//                     >
//                       <span>Create Test</span>
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {loading && notifications.length === 0 && (<Loading />)}

//             {error && !loading && (
//               <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
//                 <div className="text-center">
//                   <p className="text-red-600 mb-4">{error}</p>
//                   <button
//                     onClick={handleRetry}
//                     className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     Try Again
//                   </button>
//                 </div>
//               </div>
//             )}

//             {!loading && !error && notifications.length === 0 && (
//               <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
//                 <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
//                 <p className="text-gray-600 max-w-md mx-auto">
//                   You're all caught up! We'll notify you when there's new activity.
//                 </p>
//               </div>
//             )}

//             {/* Notifications List */}
//             {!loading && !error && notifications.length > 0 && (
//               <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//                 <div className="divide-y divide-gray-200">
//                   {notifications.map(notification => (
//                     <div 
//                       key={notification.id}
//                       className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
//                       onClick={() => handleMarkAsRead(notification.id)}
//                     >
//                       <div className="flex items-start space-x-3">
//                         <div className="flex-shrink-0">
//                           {!notification.read && (
//                             <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
//                           )}
//                         </div>
//                         <div className="flex-1">
//                           <div className="flex justify-between items-start">
//                             <h3 className="font-medium text-gray-900">{notification.title}</h3>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleDeleteNotification(notification.id);
//                               }}
//                               className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
//                               title="Delete notification"
//                             >
//                               ×
//                             </button>
//                           </div>
//                           <p className="text-gray-600 mt-1">{notification.message}</p>
//                           <div className="flex items-center justify-between mt-2">
//                             <p className="text-gray-400 text-sm">
//                               {new Date(notification.timestamp).toLocaleDateString()} • {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                             </p>
//                             {notification.type && (
//                               <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
//                                 {notification.type.replace('_', ' ')}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default NotificationsPage;

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Loading from '@/app/loading'
import Error from '@/app/error'
import { BellIcon, CheckCircleIcon } from '@/components/UI/icons';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const { 
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
    createTestNotification
  } = useNotifications();

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const handleRetry = () => {
    refetch();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification(notificationId);
      } catch (err) {
        console.error('Failed to delete notification:', err);
      }
    }
  };

  // Get role-based color classes
  const getRoleColor = (type: 'bg' | 'text' | 'hover' | 'bg-light' | 'bg-50') => {
    if (!user?.role) {
      return type === 'bg' ? 'bg-blue-600' : 
             type === 'hover' ? 'hover:bg-blue-700' :
             type === 'text' ? 'text-blue-600' :
             type === 'bg-light' ? 'bg-blue-100' :
             'bg-blue-50';
    }
    
    switch (user.role) {
      case 'volunteer':
        return type === 'bg' ? 'bg-green-600' : 
               type === 'hover' ? 'hover:bg-green-700' :
               type === 'text' ? 'text-green-600' :
               type === 'bg-light' ? 'bg-green-100' :
               'bg-green-50';
      
      case 'admin':
        return type === 'bg' ? 'bg-purple-600' : 
               type === 'hover' ? 'hover:bg-purple-700' :
               type === 'text' ? 'text-purple-600' :
               type === 'bg-light' ? 'bg-purple-100' :
               'bg-purple-50';
      
      case 'citizen':
      default:
        return type === 'bg' ? 'bg-blue-600' : 
               type === 'hover' ? 'hover:bg-blue-700' :
               type === 'text' ? 'text-blue-600' :
               type === 'bg-light' ? 'bg-blue-100' :
               'bg-blue-50';
    }
  };

  if (!user) {
    return (
      <MainLayout role={null}>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
                <p className="text-gray-600 mb-6">
                  You need to be logged in to view notifications.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className={`${getRoleColor('bg')} ${getRoleColor('hover')} text-white px-6 py-3 rounded-lg transition-colors`}
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role={user?.role || null}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 ${getRoleColor('bg-light')} rounded-lg`}>
                    <BellIcon className={`h-8 w-8 ${getRoleColor('text')}`} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600 mt-1">
                      {unreadCount > 0 
                        ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                        : 'All caught up!'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={loading}
                      className={`flex items-center justify-center space-x-2 ${getRoleColor('bg')} ${getRoleColor('hover')} text-white px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Mark all as read</span>
                    </button>
                  )}
                  
                  {/* {process.env.NODE_ENV !== 'production' && (
                    <button
                      onClick={createTestNotification}
                      className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <span>Create Test</span>
                    </button>
                  )} */}
                </div>
              </div>
            </div>

            {loading && notifications.length === 0 && (<Loading />)}

            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={handleRetry}
                    className={`${getRoleColor('bg')} ${getRoleColor('hover')} text-white px-4 py-2 rounded-lg transition-colors`}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  You're all caught up! We'll notify you when there's new activity.
                </p>
              </div>
            )}

            {/* Notifications List */}
            {!loading && !error && notifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? getRoleColor('bg-50') : ''
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {!notification.read && (
                            <div className={`w-2 h-2 ${getRoleColor('bg')} rounded-full mt-2`}></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900">{notification.title}</h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                              title="Delete notification"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-gray-400 text-sm">
                              {new Date(notification.timestamp).toLocaleDateString()} • {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {notification.type && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {notification.type.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;