export interface Notification {
  id: string;
  type: 'issue_update' | 'new_comment' | 'issue_resolved' | 'volunteer_assigned' | 'achievement_unlocked' | 'system_alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  metadata?: {
    issueId?: string;
    commentId?: string;
    achievementId?: string;
    userId?: string;
    [key: string]: any;
  };
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  type?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  issueUpdates: boolean;
  communityNews: boolean;
  volunteerOpportunities: boolean;
  digestFrequency: 'never' | 'daily' | 'weekly';
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Record<string, number>;
}