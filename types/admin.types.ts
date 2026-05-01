export interface AnalyticsData {
    overview: {
      totalUsers: number; totalIssues: number; resolvedIssues: number;
      activeVolunteers: number; newUsersThisWeek: number; issuesThisWeek: number;
    }
    issuesByStatus:   { status: string; count: number }[]
    issuesByCategory: { category: string; count: number }[]
    userGrowth:       { date: string; count: number }[]
    issueTrends:      { date: string; reported: number; resolved: number }[]
}
  
export interface TrendsData {
    period: string
    trends: {
      issues: { date: string; created: number; resolved: number; net: number }[]
      users:  { date: string; citizens: number; volunteers: number; total: number }[]
    }
    summary: {
      totalIssuesCreated: number; totalIssuesResolved: number;
      totalUsersRegistered: number; totalVolunteersRegistered: number;
      avgDailyIssues: number; avgDailyResolved: number; resolutionRate: number;
      peakIssueDay:            { date: string; count: number } | null
      peakResolutionDay:       { date: string; count: number } | null
      peakUserRegistrationDay: { date: string; count: number } | null
    }
}
  
export interface GeographicData {
    byCity:  { city: string; count: number; latitude: number; longitude: number }[]
    byState: { state: string; count: number }[]
}
  
export interface PlatformMetricsData {
    totalUsers: number; totalIssues: number; totalComments: number; totalVotes: number;
    engagementRate: number; avgResponseTimeHours: number;
    topCategories: { category: string; count: number }[];
    dailyActiveUsers: number; weeklyActiveUsers: number; monthlyActiveUsers: number;
}

export interface AdminDashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalIssues: number;
    activeIssues: number;
    resolvedIssues: number;
    resolvedThisWeek: number;
    pendingIssues: number;
    systemHealth: number;
    newRegistrations: number;
    activeVolunteers: number;
    userTrend:       { value: number; isPositive: boolean };
    issueTrend:      { value: number; isPositive: boolean };
    resolutionTrend: { value: number; isPositive: boolean };
}
  
export interface SystemAlert {
    id: string;
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    timestamp: string;
    resolved?: boolean;
}
  
export interface AdminDashboardResponse {
    stats: AdminDashboardStats;
    systemAlerts: SystemAlert[];
    recentNotifications: any[];
    pendingIssues: any[];
    recentUsers: any[];
    issuesByStatus: { status: string; count: number }[];
    issuesByCategory: { category: string; count: number }[];
}