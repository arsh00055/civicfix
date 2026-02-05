export interface NotificationOptions {
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface INotificationService {
  hasPermission(): boolean;
  requestPermission(): Promise<boolean>;
  isSupported(): boolean;
  showBrowserNotification(title: string, body: string, tag?: string): void;
  showSuccessNotification(message: string): void;
  showErrorNotification(message: string): void;
  showInfoNotification(message: string): void;
  showWarningNotification(message: string): void;
  showNotification(title: string, options?: NotificationOptions): void;
  getNotifications(): Promise<any[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
  getUnreadCount(): Promise<number>;
}

class NotificationService implements INotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.initialize();
  }

  static getInstance(): INotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private initialize(): void {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public hasPermission(): boolean {
    return this.permission === 'granted';
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'default') {
      try {
        this.permission = await Notification.requestPermission();
      } catch (error) {
        console.error('Failed to request notification permission:', error);
        return false;
      }
    }

    return this.hasPermission();
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  showBrowserNotification(title: string, body: string, tag?: string): void {
    if (!this.hasPermission()) {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const options: NotificationOptions = {
        tag,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        requireInteraction: false,
        silent: false,
      };

      const notification = new Notification(title, options as any);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      notification.onclose = () => {
        console.log('Notification closed:', title);
      };

      setTimeout(() => {
        if (notification && typeof notification.close === 'function') {
          notification.close();
        }
      }, 5000);
    } catch (error) {
      console.error('Failed to show browser notification:', error);
    }
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

  showWarningNotification(message: string): void {
    this.showBrowserNotification('Warning', message, 'warning');
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if (!this.hasPermission()) {
      console.warn('Cannot show notification: permission not granted');
      return;
    }

    try {
      const defaultOptions: NotificationOptions = {
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        requireInteraction: false,
        silent: false,
      };

      const notificationOptions = { ...defaultOptions, ...options };

      const notification = new Notification(title, notificationOptions as any);

      notification.onclick = () => {
        if (notificationOptions.data?.url) {
          window.open(notificationOptions.data.url, '_blank');
        }
        window.focus();
        notification.close();
      };

      notification.onclose = () => {
        console.log('Custom notification closed:', title);
      };

      setTimeout(() => {
        if (notification && typeof notification.close === 'function') {
          notification.close();
        }
      }, options?.requireInteraction ? 10000 : 5000);
    } catch (error) {
      console.error('Failed to show custom notification:', error);
    }
  }

  // API methods for notification management
  async getNotifications(): Promise<any[]> {
    try {
      // TODO: Replace with actual API call
      return [];
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      // TODO: Replace with actual API call
      console.log('Marking notification as read:', notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      // TODO: Replace with actual API call
      console.log('Marking all notifications as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      // TODO: Replace with actual API call
      console.log('Deleting notification:', notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      // TODO: Replace with actual API call
      return 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export default NotificationService.getInstance();