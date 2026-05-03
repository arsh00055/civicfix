'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import NotificationList from './NotificationList';
import IconButton from '@/components/UI/buttons/IconButton';
import { BellIcon, WifiSlashIcon } from '@/components/UI/icons';

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const notificationCenterRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    loading, 
    error,
    refetch
  } = useNotifications();

  useEffect(() => {
    // Check online status
    const updateConnectionStatus = () => {
      setIsConnected(navigator.onLine);
    };

    updateConnectionStatus();
    
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    return () => {
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', updateConnectionStatus);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationCenterRef.current && 
          !notificationCenterRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-refresh notifications when coming online
  useEffect(() => {
    if (isConnected && isOpen) {
      refetch();
    }
  }, [isConnected, isOpen, refetch]);

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (!isConnected) {
      alert('You are offline. Please connect to mark all as read.');
      return;
    }
    await markAllAsRead();
  };

  const handleViewAllClick = () => {
    setIsOpen(false);
    router.push('/notifications');
  };

  const handleRetry = () => {
    if (isConnected) {
      refetch();
    } else {
      setIsConnected(navigator.onLine);
    }
  };

  return (
    <div className="relative" ref={notificationCenterRef}>
      {/* Notification Bell */}
      <div className="relative">
        <IconButton
          icon={BellIcon}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors ${
            !isConnected ? 'text-orange-500 hover:text-orange-600' : ''
          }`}
          title={`Notifications ${!isConnected ? '(Offline)' : ''}`}
          aria-label={`Notifications ${unreadCount > 0 ? `${unreadCount} unread` : ''}`}
          disabled={loading}
        />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Connection Status Dot */}
        {!isConnected && (
          <span 
            className="absolute -bottom-1 -right-1 bg-orange-500 border-2 border-white rounded-full h-3 w-3"
            title="Offline mode"
          />
        )}
      </div>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {!isConnected && (
                <div className="flex items-center space-x-1">
                  <WifiSlashIcon className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-orange-600 font-medium">Offline</span>
                </div>
              )}
            </div>
            {unreadCount > 0 && isConnected && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !isConnected}
              >
                {loading ? 'Marking...' : 'Mark all as read'}
              </button>
            )}
          </div>

          {/* Connection Warning */}
          {!isConnected && (
            <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
              <p className="text-xs text-orange-800 flex items-center">
                <WifiSlashIcon className="h-3 w-3 mr-1" />
                You're offline. Some features may be limited.
              </p>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {error ? (
              <div className="p-6 text-center">
                <div className="text-red-500 mb-2">
                  <p className="font-medium">Failed to load notifications</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
                <button 
                  onClick={handleRetry}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Retrying...' : 'Try again'}
                </button>
              </div>
            ) : loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="font-medium">Loading notifications...</p>
                {!isConnected && (
                  <p className="text-sm mt-1 text-orange-600">Loading in offline mode</p>
                )}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="font-medium">No notifications</p>
                <p className="text-sm mt-1">We'll notify you when something arrives</p>
                {!isConnected && (
                  <p className="text-xs mt-2 text-orange-600">Showing cached notifications only</p>
                )}
              </div>
            ) : (
              <NotificationList
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
              />
            )}
          </div>

          {/* Footer */}
          {(notifications.length > 0 || isConnected) && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleViewAllClick}
                className="block w-full text-center text-sm cursor-pointertext-blue-600 hover:text-blue-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isConnected}
              >
                {isConnected ? 'View all notifications' : 'View all (requires connection)'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;