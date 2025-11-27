export * from './auth.types';
export * from './issue.types';
export * from './user.types';
export * from './api.types';
export * from './notification.types';
// types/index.ts
export interface SystemAlert {
  id: number;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp?: string;
}

export interface DashboardStats {
  totalUsers?: number;
  activeIssues?: number;
  resolvedThisWeek?: number;
  userGrowth?: { value: number; isPositive: boolean };
  issueTrend?: { value: number; isPositive: boolean };
  resolutionRate?: { value: number; isPositive: boolean };
}

export interface VolunteerStats {
  completedTasks: number;
  activeTasks: number;
  responseTime: string;
  rating: string;
  completionRate?: number;
  efficiencyTrend?: { value: number; isPositive: boolean };
}

export interface CitizenStats {
  reportedIssues: number;
  resolvedIssues: number;
  activeIssues: number;
  communityScore: number;
  issueTrend?: { value: number; isPositive: boolean };
  resolutionTrend?: { value: number; isPositive: boolean };
}