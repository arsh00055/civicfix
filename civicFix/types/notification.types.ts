export type NotificationType = 
  | 'issue_update' 
  | 'new_comment' 
  | 'issue_resolved' 
  | 'volunteer_assigned' 
  | 'achievement_unlocked' 
  | 'system_alert'
  | 'welcome'
  | 'password_reset'
  | 'verification'
  | 'report_generated'
  | 'community_update'
  | 'volunteer_request'
  | 'task_reminder'
  | 'deadline_approaching';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  seen: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'user' | 'issue' | 'achievement' | 'community';
  metadata?: {
    issueId?: string;
    commentId?: string;
    achievementId?: string;
    userId?: string;
    reportId?: string;
    url?: string;
    [key: string]: any;
  };
  actions?: NotificationAction[];
  expiresAt?: string;
  source?: {
    userId?: string;
    userName?: string;
    userAvatar?: string;
  };
}

export interface NotificationAction {
  id: string;
  label: string;
  onClick: () => void | Promise<void>;
  type?: 'primary' | 'secondary' | 'danger' | 'success';
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  confirm?: boolean;
  confirmMessage?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  issueUpdates: boolean;
  communityNews: boolean;
  volunteerOpportunities: boolean;
  achievementNotifications: boolean;
  systemAlerts: boolean;
  digestFrequency: 'never' | 'daily' | 'weekly' | 'monthly';
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
  };
  notificationSound: boolean;
  vibration: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  recentActivity: Array<{
    date: string;
    count: number;
  }>;
}

export interface NotificationBatch {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

export interface NotificationSettings {
  preferences: NotificationPreferences;
  channels: {
    email: string[];
    phone?: string;
    devices?: string[];
  };
  filters: {
    minPriority: 'low' | 'medium' | 'high' | 'critical';
    categories: string[];
  };
  snoozeUntil?: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}