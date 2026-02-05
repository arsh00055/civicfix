import type { UserProfile, Achievement, UserActivity } from './user.types';

export interface Profile extends UserProfile {
  stats: {
    weeklyActivity: number;
    monthlyProgress: number;
    yearlyMilestones: number;
    contributionStreak: number;
  };
  recentAchievements: Achievement[];
  recentActivity: UserActivity[];
  badges: ProfileBadge[];
  connections: ProfileConnection[];
  recommendations: ProfileRecommendation[];
}

export interface ProfileBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
  category: 'reporting' | 'volunteering' | 'community' | 'milestone';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface ProfileConnection {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  role: string;
  connectedSince: string;
  mutualIssues: number;
  lastInteraction: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface ProfileRecommendation {
  id: string;
  type: 'skill' | 'achievement' | 'connection' | 'issue';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  action: {
    label: string;
    url: string;
    method: string;
  };
  estimatedTime?: string;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
}

export interface ProfileUpdateRequest {
  name?: string;
  bio?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  skills?: string[];
  availability?: {
    days?: string[];
    hours?: {
      start: string;
      end: string;
    };
  };
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    privacy?: {
      profileVisible?: boolean;
      showEmail?: boolean;
      showPhone?: boolean;
    };
  };
}

export interface ProfileStats {
  overview: {
    totalPoints: number;
    level: number;
    rank: number;
    joinDate: string;
    lastActive: string;
  };
  reporting: {
    totalReported: number;
    resolvedReports: number;
    resolutionRate: number;
    averageResolutionTime: number;
    trendingIssues: number;
  };
  volunteering: {
    tasksCompleted: number;
    volunteerHours: number;
    responseRate: number;
    averageResponseTime: number;
    communityRating: number;
  };
  community: {
    commentsMade: number;
    upvotesReceived: number;
    connections: number;
    sharesMade: number;
    helpfulFlags: number;
  };
  achievements: {
    total: number;
    byTier: {
      bronze: number;
      silver: number;
      gold: number;
      platinum: number;
    };
    recent: Achievement[];
    inProgress: Array<{
      achievement: Achievement;
      progress: number;
      remaining: number;
    }>;
  };
}

export interface ProfileView {
  profile: Profile;
  stats: ProfileStats;
  isOwnProfile: boolean;
  canEdit: boolean;
  canMessage: boolean;
  canConnect: boolean;
}