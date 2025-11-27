import React from 'react';
import { useNotifications } from '../../features/notifications/hooks/useNotifications';
import NotificationList from '../../features/notifications/components/NotificationList';
import { BellIcon, CheckCircleIcon } from '../../components/UI/icons';
import Sidebar from '../../components/layout/sidebar/Sidebar';
import Header from '../../components/layout/Header/Header';
import { useAppSelector } from '../../app/store/hooks';

interface NotificationsProps {
  role: string | null;
}

const NotificationsPage: React.FC<NotificationsProps> = ({ role }) => {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAllAsRead, 
    markAsRead,
    refetch 
  } = useNotifications();

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conditionally render Sidebar based on state */}
      {sidebarOpen && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole={role} />
        <main className="flex-1 overflow-auto p-6">
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <BellIcon className="h-6 w-6 text-blue-600" />
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
                  
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Mark all as read</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-red-800 font-medium">Failed to load notifications</h3>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                    <button
                      onClick={handleRetry}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading notifications...</p>
                </div>
              )}

              {/* Empty State */}
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
                  <NotificationList
                    notifications={notifications}
                    onNotificationClick={handleNotificationClick}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;