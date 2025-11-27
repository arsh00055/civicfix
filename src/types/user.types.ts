import type { NotificationPreferences } from './notification.types';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'volunteer' | 'admin';
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  skills?: string[];
  availability?: string[];
  organization?: string;
  joinDate: string;
  reputation: number;
  completedIssues: number;
  responseTime?: number; // For volunteers
  verification: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  preferences: {
    notifications: NotificationPreferences;
    location: LocationPreferences;
    privacy: PrivacySettings;
  };
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  issueUpdates: boolean;
  communityNews: boolean;
  volunteerOpportunities: boolean;
}

export interface LocationPreferences {
  shareLocation: boolean;
  notificationRadius: number;
  preferredAreas: string[];
}

export interface PrivacySettings {
  profileVisible: boolean;
  activityPublic: boolean;
  showEmail: boolean;
  showPhone: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  unlockedAt?: string;
  requirements?: {
    type: string;
    target: number;
    current: number;
  }[];
}

export interface UserActivity {
  id: string;
  type: 'issue_reported' | 'issue_resolved' | 'comment_added' | 'achievement_unlocked';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}