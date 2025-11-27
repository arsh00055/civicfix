import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationList from './NotificationList';
import IconButton from '../../../components/UI/buttons/IconButton';
import { BellIcon, WifiSlashIcon } from '../../../components/UI/icons';

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notificationCenterRef = useRef<HTMLDivElement>(null);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    loading, 
    error,
    isConnected 
  } = useNotifications();

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

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleViewAllClick = () => {
    setIsOpen(false);
    window.location.href = '/notifications';
  };

  return (
    <div className="notification-center relative" ref={notificationCenterRef}>
      {/* Notification Bell */}
      <div className="relative">
        <IconButton
          icon={BellIcon}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-2 hover:bg-gray-100 rounded-full transition-colors ${
            !isConnected ? 'text-orange-500' : ''
          }`}
          title={`Notifications ${!isConnected ? '(Offline)' : ''}`}
          aria-label={`Notifications ${unreadCount > 0 ? `${unreadCount} unread` : ''}`}
        />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Connection Status Dot */}
        {!isConnected && (
          <span className="absolute -bottom-1 -right-1 bg-orange-500 border-2 border-white rounded-full h-3 w-3" />
        )}
      </div>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {!isConnected && (
                <WifiSlashIcon className="h-4 w-4 text-orange-500" />
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
                disabled={loading}
              >
                {loading ? 'Marking...' : 'Mark all as read'}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {error ? (
              <div className="p-4 text-center text-red-500">
                <p>Failed to load notifications</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-sm text-blue-600 mt-2"
                >
                  Try again
                </button>
              </div>
            ) : loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p>No notifications</p>
                <p className="text-sm mt-1">We'll notify you when something arrives</p>
              </div>
            ) : (
              <NotificationList
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
              />
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleViewAllClick}
                className="block w-full text-center text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;