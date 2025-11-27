interface INotificationService {
  hasPermission(): boolean;
  requestPermission(): Promise<boolean>;
  isSupported(): boolean;
  showBrowserNotification(title: string, body: string, tag?: string): void;
  showSuccessNotification(message: string): void;
  showErrorNotification(message: string): void;
  showInfoNotification(message: string): void;
  showNotification(title: string, options?: NotificationOptions): void;
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
      this.permission = await Notification.requestPermission();
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

    const notification = new Notification(title, {
      body,
      tag,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => {
      notification.close();
    }, 5000);
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

  showNotification(title: string, options?: NotificationOptions): void {
    if (!this.hasPermission()) return;

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
}

// Export with proper typing
export { NotificationService, type INotificationService };
export default NotificationService.getInstance();