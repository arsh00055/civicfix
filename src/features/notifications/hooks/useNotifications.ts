import { useState, useEffect } from 'react';
import type { Notification } from '../../../types';
import { notificationsAPI } from '../../../services/api/endpoints';
import NotificationService from '../../../services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await notificationsAPI.getNotifications();
      // Handle different response formats
      const notificationsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.notifications || [];
      
      setNotifications(notificationsData);
      
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setError('Failed to load notifications');
      
      // Set fallback mock data
      setNotifications([
        {
          id: '1',
          type: 'issue_update',
          title: 'Issue Updated',
          message: 'Your reported issue is now in progress',
          timestamp: new Date().toISOString(),
          read: false,
          metadata: { issueId: '1' }
        },
        {
          id: '2',
          type: 'new_comment',
          title: 'New Comment',
          message: 'Someone commented on your issue',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          read: true,
          metadata: { issueId: '1' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getUnreadCount = async (): Promise<number> => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      return response.data.count;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      // Fallback to client-side calculation
      return notifications.filter(n => !n.read).length;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      await notificationsAPI.markAsRead(notificationId);
      
      // Show browser notification for important updates
      if ((NotificationService as any).hasPermission()) {
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          (NotificationService as any).showBrowserNotification(
            'Notification Read',
            `${notification.title} marked as read`
          );
        }
      }
      
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert on error
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: false }
            : notification
        )
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length === 0) return;

      // Optimistic update
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );

      await notificationsAPI.markAllAsRead();
      
      // Show browser notification
      if ((NotificationService as any).hasPermission()) {
        (NotificationService as any).showBrowserNotification(
          'All Notifications Read',
          `Marked ${unreadNotifications.length} notifications as read`
        );
      }
      
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      // Revert on error
      await fetchNotifications();
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // Store the notification for potential revert
      const deletedNotification = notifications.find(n => n.id === notificationId);
      
      // Optimistic update
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );

      await notificationsAPI.deleteNotification(notificationId);
      
      // Show undo notification
      if ((NotificationService as any).hasPermission() && deletedNotification) {
        (NotificationService as any).showBrowserNotification(
          'Notification Deleted',
          `${deletedNotification.title} has been deleted`
        );
      }
      
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Refetch to revert
      await fetchNotifications();
    }
  };

  const createTestNotification = async () => {
    try {
      const testNotification: Notification = {
        id: `test-${Date.now()}`,
        type: 'system_alert',
        title: 'Test Notification',
        message: 'This is a test notification created at ' + new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString(),
        read: false,
        metadata: { test: true }
      };

      // Optimistically add to list
      setNotifications(prev => [testNotification, ...prev]);

      // Show browser notification
      if ((NotificationService as any).hasPermission()) {
        (NotificationService as any).showBrowserNotification(
          testNotification.title,
          testNotification.message
        );
      }

      // In a real app, you would call an API to create the notification
      // await notificationsAPI.createNotification(testNotification);
      
    } catch (error) {
      console.error('Failed to create test notification:', error);
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
    refetch: fetchNotifications,
    refresh: refreshNotifications,
    createTestNotification,
  };
};