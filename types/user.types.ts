// types/user.types.ts
import type { BaseUser } from './base.types';
import type { NotificationPreferences } from './notification.types';

export interface UserProfile extends BaseUser {
  userId: string; // Duplicate of id but kept for backward compatibility
  coverImage?: string;
  bio?: string;

  achievements?: Achievement[]; 
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  skills?: string[];
  certifications?: string[];
  experience?: string;
  availability?: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
    timezone: string;
  };
  organization?: string;
  position?: string;
  joinDate: string;
  lastActive: string;
  reputation: number;
  points: number;
  level: number;
  completedIssues: number;
  reportedIssues: number;
  assignedIssues: number;
  responseTime?: number;
  rating?: number;
  totalRatings?: number;
  verification: {
    email: boolean;
    phone: boolean;
    identity: boolean;
    background: boolean;
    address: boolean;
  };
  preferences: {
    notifications: NotificationPreferences;
    location: LocationPreferences;
    privacy: PrivacySettings;
    display: DisplaySettings;
  };
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
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
}

export interface LocationPreferences {
  shareLocation: boolean;
  notificationRadius: number;
  preferredAreas: string[];
  autoDetectLocation: boolean;
  defaultLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface PrivacySettings {
  profileVisible: boolean;
  activityPublic: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showStats: boolean;
  showAchievements: boolean;
  allowMessages: 'everyone' | 'contacts' | 'volunteers' | 'admins' | 'nobody';
  searchIndexable: boolean;
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  compactMode: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'comfortable' | 'spacious';
}

export interface Achievement {
  id: string;
  userId: string;
  name: string;
  description: string;
  icon: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  category: 'reporting' | 'volunteering' | 'community' | 'milestone' | 'special';
  points: number;
  unlockedAt: string;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
  requirements?: AchievementRequirement[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  metadata?: Record<string, any>;
}

export interface AchievementRequirement {
  type: string;
  target: number;
  current: number;
  description: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 
    | 'issue_reported' 
    | 'issue_resolved' 
    | 'comment_added' 
    | 'achievement_unlocked'
    | 'profile_updated'
    | 'login'
    | 'logout'
    | 'issue_voted'
    | 'issue_claimed'
    | 'task_completed'
    | 'level_up';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
  visibility: 'public' | 'private' | 'friends';
}

export interface UserStats {
  overall: {
    points: number;
    level: number;
    rank: number;
    percentile: number;
  };
  reporting: {
    totalIssues: number;
    resolvedIssues: number;
    activeIssues: number;
    averageResolutionTime: number;
    upvotesReceived: number;
    reportsThisMonth: number;
    reportsThisWeek: number;
  };
  volunteering: {
    tasksCompleted: number;
    tasksInProgress: number;
    averageResponseTime: number;
    completionRate: number;
    volunteerHours: number;
    rating: number;
  };
  community: {
    commentsMade: number;
    helpfulComments: number;
    issuesVoted: number;
    sharesMade: number;
    communityScore: number;
  };
  achievements: {
    total: number;
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    diamond: number;
  };
  trends: {
    weeklyActivity: Array<{ date: string; count: number }>;
    monthlyProgress: Array<{ month: string; points: number }>;
    categoryDistribution: Record<string, number>;
  };
}

export interface UserSearchFilters {
  name?: string;
  email?: string;
  role?: string[];
  status?: 'active' | 'inactive' | 'suspended';
  verification?: {
    email?: boolean;
    phone?: boolean;
    identity?: boolean;
  };
  location?: string;
  skills?: string[];
  minRating?: number;
  minIssues?: number;
  joinDateRange?: {
    start?: string;
    end?: string;
  };
  lastActiveRange?: {
    start?: string;
    end?: string;
  };
  sortBy?: 'name' | 'joinDate' | 'lastActive' | 'rating' | 'issues';
  sortOrder?: 'asc' | 'desc';
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  availability?: UserProfile['availability'];
  address?: UserProfile['address'];
  socialLinks?: UserProfile['socialLinks'];
  preferences?: Partial<UserProfile['preferences']>;
  avatar?: File | string;
  coverImage?: File | string;
}