// lib/services/notificationService.ts
'use client';

import apiClient from './api/client';
import { notificationsAPI } from './api/endpoints';

interface Notification {
  _id: string;
  id?: string;
  type: string;
  title: string;
  message: string;
  targetRole: string;
  targetType: string;
  targetUserId?: string;
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  isArchived: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  private notifications: Notification[] = [];
  private listeners: (() => void)[] = [];
  private unreadCount: number = 0;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  async hasPermission(): Promise<boolean> {
    return this.permission === 'granted';
  }

  // Alias for fetchNotifications - maintains backward compatibility
  async getNotifications(): Promise<Notification[]> {
    return this.fetchNotifications();
  }

  async fetchNotifications(): Promise<Notification[]> {
    try {
      const response = await notificationsAPI.getNotifications();
      this.notifications = response.data?.notifications || [];
      this.notifyListeners();
      return this.notifications;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  getCachedNotifications(): Notification[] {
    return this.notifications;
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await notificationsAPI.getUnreadCount();
      this.unreadCount = response.data?.count || 0;
      return this.unreadCount;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return this.notifications.filter(n => !n.isRead).length;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await notificationsAPI.markAsRead(notificationId);
      this.notifications = this.notifications.map(n => 
        n._id === notificationId || n.id === notificationId 
          ? { ...n, isRead: true } 
          : n
      );
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await notificationsAPI.markAllAsRead();
      this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
      this.unreadCount = 0;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      const deleted = this.notifications.find(n => n._id === notificationId || n.id === notificationId);
      this.notifications = this.notifications.filter(n => 
        n._id !== notificationId && n.id !== notificationId
      );
      if (deleted && !deleted.isRead) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    return this.permission === 'granted';
  }

  showBrowserNotification(title: string, body: string, tag?: string, url?: string): void {
    if (this.permission !== 'granted') return;

    const notification = new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag,
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      if (url) {
        window.location.href = url;
      }
      notification.close();
    };

    setTimeout(() => notification.close(), 8000);
  }

  showSuccessNotification(message: string): void {
    this.showBrowserNotification('✅ Success', message, 'success');
  }

  showErrorNotification(message: string): void {
    this.showBrowserNotification('❌ Error', message, 'error');
  }

  showInfoNotification(message: string): void {
    this.showBrowserNotification('ℹ️ Info', message, 'info');
  }
}

const notificationService = NotificationService.getInstance();
export default notificationService;