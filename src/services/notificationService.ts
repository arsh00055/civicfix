class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.requestPermission();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
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

export default NotificationService.getInstance();