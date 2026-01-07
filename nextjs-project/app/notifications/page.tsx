'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Loading from '@/app/loading'
import Error from '@/app/error'
import { BellIcon, CheckCircleIcon } from '@/components/UI/icons';
import { useAuth } from '@/features/auth/hooks/useAuth';
import apiClient from '@/lib/services/api/client';

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch notifications
      const response = await apiClient.get('/notifications');
      const data = response.data || response;
      setNotifications(data.notifications || []);
      
      // Calculate unread count
      const unread = (data.notifications || []).filter((n: any) => !n.read).length;
      setUnreadCount(unread);

    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleRetry = () => {
    fetchNotifications();
  };

  if (!user) {
    return (
      <MainLayout role={null}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
              <p className="text-gray-600 mb-6">
                You need to be logged in to view notifications.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role={user?.role}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BellIcon className="h-8 w-8 text-blue-600" />
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
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Mark all as read</span>
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && notifications.length === 0 && (<Loading />)}

          {/* Error State */}
          {error && !loading && (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />)}

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
              <div className="divide-y divide-gray-200">
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-gray-400 text-sm mt-2">
                          {new Date(notification.timestamp).toLocaleDateString()} • {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back to Dashboard */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;