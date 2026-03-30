'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Notification } from '@/types/notification.types';
import notificationService from '@/lib/services/notificationService';

interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  getUnreadCount: () => Promise<number>;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  createTestNotification: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the notification service directly
      const notificationsData = await notificationService.fetchNotifications();
      
      console.log('Fetched notifications:', notificationsData);
      
      // Map the data to match your Notification type
      const mappedNotifications: Notification[] = notificationsData.map((item: any) => ({
        id: item.id,
        type: item.type || 'info',
        title: item.title,
        message: item.message,
        timestamp: item.timestamp || item.createdAt || new Date().toISOString(),
        read: item.isRead || false,
        metadata: item.metadata || {},
        seen: item.seen || false,
        priority: item.priority || 'low',
        category: item.category || 'system'
      }));
      
      setNotifications(mappedNotifications);
      
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
      
      // Fallback mock data for development
      if (process.env.NODE_ENV !== 'production') {
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'issue_update',
            title: 'Issue Updated',
            message: 'Your reported issue "Pothole on Main Street" is now in progress',
            timestamp: new Date().toISOString(),
            read: false,
            metadata: { issueId: 'issue_1' },
            seen: false,
            priority: 'low',
            category: 'user'
          },
          {
            id: '2',
            type: 'new_comment',
            title: 'New Comment',
            message: 'John Doe commented on your issue "Broken Streetlight"',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: true,
            metadata: { issueId: 'issue_2', commentId: 'comment_1' },
            seen: false,
            priority: 'low',
            category: 'user'
          },
          {
            id: '3',
            type: 'volunteer_assigned',
            title: 'Task Assigned',
            message: 'You have been assigned to fix "Graffiti Removal"',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: false,
            metadata: { issueId: 'issue_3' },
            seen: false,
            priority: 'low',
            category: 'user'
          },
        ];
        setNotifications(mockNotifications);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getUnreadCount = useCallback(async (): Promise<number> => {
    try {
      const count = await notificationService.getUnreadCount();
      return typeof count === 'number' ? count : 0;
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
      return notifications.filter(n => !n.read).length;
    }
  }, [notifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const notificationToUpdate = notifications.find(n => n.id === notificationId);
      
      // Optimistic update
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      await notificationService.markAsRead(notificationId);
      
      // Show browser notification
      if (notificationToUpdate && !notificationToUpdate.read) {
        try {
          if (await notificationService.hasPermission()) {
            notificationService.showBrowserNotification(
              'Notification Read',
              `${notificationToUpdate.title} marked as read`
            );
          }
        } catch (notifErr) {
          console.warn('Failed to show browser notification:', notifErr);
        }
      }
      
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Revert on error
      await fetchNotifications();
      throw err;
    }
  }, [notifications, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length === 0) return;

      // Optimistic update
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );

      await notificationService.markAllAsRead();
      
      // Show browser notification
      try {
        if (await notificationService.hasPermission()) {
          notificationService.showBrowserNotification(
            'All Notifications Read',
            `Marked ${unreadNotifications.length} notifications as read`
          );
        }
      } catch (notifErr) {
        console.warn('Failed to show browser notification:', notifErr);
      }
      
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      await fetchNotifications();
      throw err;
    }
  }, [notifications, fetchNotifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const deletedNotification = notifications.find(n => n.id === notificationId);
      
      // Optimistic update
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );

      await notificationService.deleteNotification(notificationId);
      
      // Show undo notification
      if (deletedNotification) {
        try {
          if (await notificationService.hasPermission()) {
            notificationService.showBrowserNotification(
              'Notification Deleted',
              `${deletedNotification.title} has been deleted`
            );
          }
        } catch (notifErr) {
          console.warn('Failed to show browser notification:', notifErr);
        }
      }
      
    } catch (err) {
      console.error('Failed to delete notification:', err);
      await fetchNotifications();
      throw err;
    }
  }, [notifications, fetchNotifications]);

  const createTestNotification = useCallback(async () => {
    try {
      const testNotification: Notification = {
        id: `test-${Date.now()}`,
        type: 'system_alert',
        title: 'Test Notification',
        message: `This is a test notification created at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toISOString(),
        read: false,
        metadata: { test: true },
        seen: false,
        priority: 'low',
        category: 'system'
      };

      // Optimistically add to list
      setNotifications(prev => [testNotification, ...prev]);

      // Show browser notification
      try {
        if (await notificationService.hasPermission()) {
          notificationService.showBrowserNotification(
            testNotification.title,
            testNotification.message
          );
        }
      } catch (notifErr) {
        console.warn('Failed to show browser notification:', notifErr);
      }
      
    } catch (err) {
      console.error('Failed to create test notification:', err);
      throw err;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    return await notificationService.requestPermission();
  }, []);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

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
    requestPermission,
  };
};