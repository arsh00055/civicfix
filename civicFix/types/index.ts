import { PaginationParams } from './base.types';

export * from './base.types';
export * from './api.types';
export * from './auth.types';
export * from './issue.types';
export * from './user.types';
export * from './reports.type';
export * from './volunteer.types';
export * from './profile.types';
export type { NotificationSettings } from './notification.types';

export interface SystemAlert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: string;
    url?: string;
  }>;
  dismissible: boolean;
  category?: 'system' | 'maintenance' | 'security' | 'feature';
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  totalIssues: number;
  activeIssues: number;
  resolvedIssues: number;
  issuesReportedToday: number;
  issuesResolvedToday: number;
  resolutionRate: number;
  averageResolutionTime: number;
  volunteerStats: {
    activeVolunteers: number;
    totalVolunteerHours: number;
    averageResponseTime: number;
    topVolunteers: Array<{
      id: string;
      name: string;
      issuesResolved: number;
      rating: number;
    }>;
  };
  geographicDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  recentActivity: Array<{
    timestamp: string;
    type: string;
    description: string;
    userId?: string;
    userName?: string;
  }>;
}

export interface VolunteerStats {
  completedTasks: number;
  activeTasks: number;
  pendingTasks: number;
  responseTime: string;
  rating: string;
  totalRating: number;
  ratingCount: number;
  completionRate: number;
  efficiencyTrend: { value: number; isPositive: boolean };
  volunteerHours: number;
  achievements: number;
  rank: number;
  percentile: number;
  streak: {
    current: number;
    longest: number;
  };
  performance: {
    weekly: Array<{ week: string; tasks: number }>;
    monthly: Array<{ month: string; tasks: number }>;
    byCategory: Record<string, number>;
  };
}

export interface CitizenStats {
  reportedIssues: number;
  resolvedIssues: number;
  activeIssues: number;
  pendingIssues: number;
  communityScore: number;
  issueTrend: { value: number; isPositive: boolean };
  resolutionTrend: { value: number; isPositive: boolean };
  contribution: {
    comments: number;
    votes: number;
    shares: number;
    helpfulFlags: number;
  };
  achievements: {
    total: number;
    unlocked: number;
    inProgress: number;
  };
  impact: {
    totalUpvotes: number;
    issuesInfluenced: number;
    communityRecognition: number;
  };
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'audio';
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}