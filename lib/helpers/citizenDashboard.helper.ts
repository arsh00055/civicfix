// lib/helpers/citizenDashboard.helper.ts
import { issuesAPI, usersAPI, achievementsAPI, notificationsAPI, analyticsAPI } from '@/lib/services/api/endpoints';
import type { Issue } from '@/types/issue.types';

export interface CitizenDashboardStats {
  reportsSubmitted: number;
  issuesResolved: number;
  achievementsEarned: number;
  communityRank: string;
  communityImpact: string;
  totalVotes: number;
  totalComments: number;
  activeVolunteers: number;
  resolutionRate: number;
  averageResolutionTime: string;
  pendingIssues: number;
  totalCommunityIssues: number;
  thisWeekReports: number;
  thisWeekResolved: number;
}

export interface CitizenDashboardData {
  stats: CitizenDashboardStats;
  myReports: Issue[];
  recentNotifications: any[];
  achievements: any[];
  communityStats: {
    totalVolunteers: number;
    activeVolunteers: number;
    totalIssues: number;
    resolvedIssues: number;
    pendingIssues: number;
    avgResolutionHours: number;
  };
}

export interface CitizenDashboardResponse {
  stats: CitizenDashboardStats;
  myReports: Issue[];
  recentNotifications: any[];
  communityStats: CitizenDashboardData['communityStats'];
}

/**
 * Fetch all dashboard data for a citizen user
 */
export async function fetchCitizenDashboard(userId: string): Promise<CitizenDashboardResponse> {
  try {
    // Fetch all required data in parallel
    const [
      userProfile,
      myReportsResponse,
      notificationsResponse,
      achievementsResponse,
      analyticsResponse
    ] = await Promise.all([
      usersAPI.getUser(userId).catch(() => ({ data: null })),
      issuesAPI.getMyReports().catch(() => ({ data: [] })),
      notificationsAPI.getNotifications().catch(() => ({ data: { notifications: [] } })),
      achievementsAPI.getUserAchievements(userId).catch(() => ({ data: [] })),
      analyticsAPI.getOverview({ timeframe: 'month' }).catch(() => ({ data: null })),
    ]);

    const userData = userProfile.data;
    const analyticsData = analyticsResponse.data;
    
    // Handle reports
    let reportsData: any[] = [];
    const reportsResponse = myReportsResponse.data;
    if (Array.isArray(reportsResponse)) {
      reportsData = reportsResponse;
    } else if (reportsResponse && Array.isArray(reportsResponse.issues)) {
      reportsData = reportsResponse.issues;
    } else if (reportsResponse && Array.isArray(reportsResponse.data)) {
      reportsData = reportsResponse.data;
    } else if (reportsResponse && reportsResponse.reports && Array.isArray(reportsResponse.reports)) {
      reportsData = reportsResponse.reports;
    }
    
    // Handle notifications
    let notificationsData: any[] = [];
    const notificationsResponseData = notificationsResponse.data;
    if (Array.isArray(notificationsResponseData)) {
      notificationsData = notificationsResponseData;
    } else if (notificationsResponseData && Array.isArray(notificationsResponseData.notifications)) {
      notificationsData = notificationsResponseData.notifications;
    } else if (notificationsResponseData && Array.isArray(notificationsResponseData.data)) {
      notificationsData = notificationsResponseData.data;
    }
    
    // Sort notifications by newest first and take latest 10
    const recentNotifications = notificationsData
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    
    // Handle achievements
    let achievementsData: any[] = [];
    const achievementsResponseData = achievementsResponse.data;
    if (Array.isArray(achievementsResponseData)) {
      achievementsData = achievementsResponseData;
    } else if (achievementsResponseData && Array.isArray(achievementsResponseData.achievements)) {
      achievementsData = achievementsResponseData.achievements;
    } else if (achievementsResponseData && Array.isArray(achievementsResponseData.data)) {
      achievementsData = achievementsResponseData.data;
    }
    
    // Get community stats from analytics
    const totalIssues = analyticsData?.overview?.totalIssues ?? 0;
    const resolvedIssues = analyticsData?.overview?.resolvedIssues ?? 0;
    const activeVolunteers = analyticsData?.overview?.activeVolunteers ?? 0;
    
    // Calculate stats
    const reportsSubmitted = userData?.stats?.totalReports ?? reportsData.length ?? 0;
    const issuesResolved = userData?.stats?.resolvedReports ?? 0;
    const achievementsEarned = achievementsData.filter((a: any) => a.unlockedAt).length ?? 0;
    const totalVotes = userData?.stats?.totalVotes ?? 0;
    const totalComments = userData?.stats?.totalComments ?? 0;
    
    // Calculate this week's stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekReports = reportsData.filter((r: any) => 
      new Date(r.createdAt) >= oneWeekAgo
    ).length;
    
    const thisWeekResolved = reportsData.filter((r: any) => 
      r.status === 'resolved' && new Date(r.resolvedAt || r.updatedAt) >= oneWeekAgo
    ).length;
    
    // Calculate resolution rate
    const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
    
    // Calculate average resolution time from user's reports
    const resolvedReports = reportsData.filter((r: any) => r.status === 'resolved' && r.resolvedAt && r.createdAt);
    let avgResolutionHours = 0;
    
    if (resolvedReports.length > 0) {
      const totalHours = resolvedReports.reduce((sum: number, report: any) => {
        const created = new Date(report.createdAt);
        const resolved = new Date(report.resolvedAt);
        const hours = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      avgResolutionHours = Math.round(totalHours / resolvedReports.length);
    }
    
    const averageResolutionTime = avgResolutionHours > 0 
      ? avgResolutionHours < 24 
        ? `${avgResolutionHours} hours`
        : `${Math.round(avgResolutionHours / 24)} days`
      : 'N/A';

    // Community stats
    const pendingIssues = totalIssues - resolvedIssues;
    
    const stats: CitizenDashboardStats = {
      reportsSubmitted,
      issuesResolved,
      achievementsEarned,
      communityRank: calculateCommunityRank(userData?.stats?.points ?? 0),
      communityImpact: calculateCommunityImpact(userData?.stats?.points ?? 0, reportsSubmitted),
      totalVotes,
      totalComments,
      activeVolunteers,
      resolutionRate,
      averageResolutionTime,
      pendingIssues,
      totalCommunityIssues: totalIssues,
      thisWeekReports,
      thisWeekResolved,
    };

    // Format reports
    const formattedReports = formatMyReports(reportsData, userId, userData?.name);
    
    // Format notifications for display
    const formattedNotifications = formatNotifications(recentNotifications);

    return {
      stats,
      myReports: formattedReports,
      recentNotifications: formattedNotifications,
      communityStats: {
        totalVolunteers: activeVolunteers,
        activeVolunteers,
        totalIssues,
        resolvedIssues,
        pendingIssues,
        avgResolutionHours,
      },
    };

  } catch (error) {
    console.error('Error fetching citizen dashboard:', error);
    return {
      stats: {
        reportsSubmitted: 0,
        issuesResolved: 0,
        achievementsEarned: 0,
        communityRank: 'Citizen',
        communityImpact: '0%',
        totalVotes: 0,
        totalComments: 0,
        activeVolunteers: 0,
        resolutionRate: 0,
        averageResolutionTime: 'N/A',
        pendingIssues: 0,
        totalCommunityIssues: 0,
        thisWeekReports: 0,
        thisWeekResolved: 0,
      },
      myReports: [],
      recentNotifications: [],
      communityStats: {
        totalVolunteers: 0,
        activeVolunteers: 0,
        totalIssues: 0,
        resolvedIssues: 0,
        pendingIssues: 0,
        avgResolutionHours: 0,
      },
    };
  }
}

/**
 * Calculate community rank based on points
 */
function calculateCommunityRank(points: number): string {
  if (points >= 5000) return 'Community Legend';
  if (points >= 2000) return 'Top Contributor';
  if (points >= 1000) return 'Active Member';
  if (points >= 500) return 'Rising Star';
  if (points >= 100) return 'Contributor';
  return 'Citizen';
}

/**
 * Calculate community impact percentage
 */
function calculateCommunityImpact(points: number, reportsSubmitted: number): string {
  if (points === 0 && reportsSubmitted === 0) return '0%';
  
  // Base impact from reports
  const reportImpact = Math.min(reportsSubmitted * 5, 50);
  // Additional impact from points
  const pointImpact = Math.min(Math.floor(points / 100), 50);
  const totalImpact = reportImpact + pointImpact;
  
  return `${Math.min(totalImpact, 100)}%`;
}

/**
 * Format my reports for display
 */
function formatMyReports(reports: any[], userId: string, userName?: string): Issue[] {
  if (!Array.isArray(reports)) {
    console.warn('formatMyReports received non-array:', reports);
    return [];
  }
  
  return reports.map((report: any) => ({
    id: report.id || report._id,
    title: report.title || 'Untitled',
    description: report.description || '',
    status: report.status || 'reported',
    priority: report.priority || 'medium',
    category: report.category || 'general',
    location: report.location || '',
    latitude: report.latitude ?? null,
    longitude: report.longitude ?? null,
    images: report.images || [],
    upvotes: report.upvotes || 0,
    voters: report.voters || [],
    views: report.views || 0,
    commentsCount: report.commentsCount ?? (report.comments?.length ?? 0),
    comments: report.comments || [],
    reporterId: report.reporterId || userId,
    reporter: {
      id: userId,
      name: userName || 'You',
    },
    assignedTo: report.assignedTo || null,
    createdAt: report.createdAt || new Date().toISOString(),
    updatedAt: report.updatedAt || report.createdAt || new Date().toISOString(),
    reportedAt: report.reportedAt || report.createdAt || new Date().toISOString(),
  }));
}

/**
 * Format notifications for display
 */
function formatNotifications(notifications: any[]): any[] {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return [
      {
        id: 'welcome',
        type: 'welcome',
        title: 'Welcome to CivicFix!',
        message: 'Start reporting issues to help your community',
        time: 'Just now',
        timestamp: new Date().toISOString(),
        user: 'System',
      },
    ];
  }

  return notifications.map((notification: any) => ({
    id: notification.id || notification._id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    time: formatRelativeTime(notification.createdAt),
    timestamp: notification.createdAt,
    user: extractUserFromNotification(notification),
    metadata: notification.metadata || {},
    actionUrl: notification.actionUrl,
  }));
}

/**
 * Extract user name from notification
 */
function extractUserFromNotification(notification: any): string {
  if (notification.metadata?.userName) return notification.metadata.userName;
  if (notification.metadata?.reporterName) return notification.metadata.reporterName;
  if (notification.metadata?.volunteerName) return notification.metadata.volunteerName;
  if (notification.metadata?.commenterName) return notification.metadata.commenterName;
  return 'System';
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'Just now';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

/**
 * Refresh dashboard data (for real-time updates)
 */
export async function refreshCitizenDashboard(userId: string): Promise<CitizenDashboardResponse> {
  return fetchCitizenDashboard(userId);
}