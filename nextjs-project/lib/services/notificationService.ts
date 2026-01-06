// lib/services/notificationService.ts
'use client';

class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    // Don't call requestPermission() here
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // ADD THIS METHOD to fix the hook error
  async hasPermission(): Promise<boolean> {
    return this.permission === 'granted';
  }

  // Remove this duplicate static method
  // static getUnreadCount() {
  //   throw new Error('Method not implemented.');
  // }

  async getNotifications(): Promise<any[]> {
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        title: 'Welcome to CivicFix!',
        message: 'Start reporting community issues today.',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'New Issue Near You',
        message: 'Pothole reported on Main Street needs attention.',
        type: 'alert',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async getUnreadCount(): Promise<number> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => !n.read).length;
  }

  async markAsRead(notificationId: string): Promise<void> {
    console.log('Marked notification as read:', notificationId);
    // In a real app, call API: await apiClient.patch(`/notifications/${notificationId}/read`)
  }

  async markAllAsRead(): Promise<void> {
    console.log('Marked all notifications as read');
    // In a real app: await apiClient.patch('/notifications/read-all')
  }

  async deleteNotification(notificationId: string): Promise<void> {
    console.log('Deleted notification:', notificationId);
    // In a real app: await apiClient.delete(`/notifications/${notificationId}`)
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') {
      console.log('Running on server, skipping notification permission');
      return false;
    }
    
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    return this.permission === 'granted';
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if (this.permission !== 'granted') return;

    const notification = new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  showBrowserNotification(title: string, body: string, tag?: string): void {
    this.showNotification(title, {
      body,
      tag,
      requireInteraction: true,
    });
  }

  showSuccessNotification(message: string): void {
    this.showBrowserNotification('Success', message, 'success');
  }

  showErrorNotification(message: string): void {
    this.showBrowserNotification('Error', message, 'error');
  }

  showInfoNotification(message: string): void {
    this.showBrowserNotification('Information', message, 'info');
  }
}

const notificationService = NotificationService.getInstance();
export default notificationService;