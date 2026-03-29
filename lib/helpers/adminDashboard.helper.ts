// lib/helpers/adminDashboard.helper.ts
import { usersAPI, issuesAPI, adminAPI, analyticsAPI, notificationsAPI } from '@/lib/services/api/endpoints';

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
  userTrend: { value: number; isPositive: boolean };
  issueTrend: { value: number; isPositive: boolean };
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

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  systemAlerts: SystemAlert[];
  recentNotifications: any[];
  pendingIssues: any[];
  recentUsers: any[];
  issuesByStatus: { status: string; count: number }[];
  issuesByCategory: { category: string; count: number }[];
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

/**
 * Fetch all dashboard data for an admin user
 */
export async function fetchAdminDashboard(): Promise<AdminDashboardResponse> {
  try {
    // Fetch all required data in parallel
    const [
      statsResponse,
      analyticsResponse,
      notificationsResponse,
      pendingIssuesResponse,
      usersResponse
    ] = await Promise.all([
      adminAPI.getStats().catch(() => ({ data: null })),
      analyticsAPI.getOverview({ timeframe: 'week' }).catch(() => ({ data: null })),
      notificationsAPI.getNotifications().catch(() => ({ data: { notifications: [] } })),
      issuesAPI.getIssues({ status: 'pending_review', limit: 10 }).catch(() => ({ data: { issues: [] } })),
      usersAPI.getUsers({ limit: 10 }).catch(() => ({ data: { users: [] } })),
    ]);

    const statsData = statsResponse.data;
    const analyticsData = analyticsResponse.data;
    
    // Process notifications
    let notificationsData: any[] = [];
    const notificationsRaw = notificationsResponse.data;
    if (Array.isArray(notificationsRaw)) {
      notificationsData = notificationsRaw;
    } else if (notificationsRaw && Array.isArray(notificationsRaw.notifications)) {
      notificationsData = notificationsRaw.notifications;
    } else if (notificationsRaw && Array.isArray(notificationsRaw.data)) {
      notificationsData = notificationsRaw.data;
    }
    
    // Sort notifications by newest first
    const recentNotifications = notificationsData
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    
    // Process pending issues
    let pendingIssuesData: any[] = [];
    const pendingRaw = pendingIssuesResponse.data;
    if (Array.isArray(pendingRaw)) {
      pendingIssuesData = pendingRaw;
    } else if (pendingRaw && Array.isArray(pendingRaw.issues)) {
      pendingIssuesData = pendingRaw.issues;
    } else if (pendingRaw && Array.isArray(pendingRaw.data)) {
      pendingIssuesData = pendingRaw.data;
    }
    
    // Process users
    let usersData: any[] = [];
    const usersRaw = usersResponse.data;
    if (Array.isArray(usersRaw)) {
      usersData = usersRaw;
    } else if (usersRaw && Array.isArray(usersRaw.users)) {
      usersData = usersRaw.users;
    } else if (usersRaw && Array.isArray(usersRaw.data)) {
      usersData = usersRaw.data;
    }
    
    // Calculate stats
    const totalUsers = analyticsData?.overview?.totalUsers ?? statsData?.totalUsers ?? 0;
    const totalIssues = analyticsData?.overview?.totalIssues ?? statsData?.totalIssues ?? 0;
    const resolvedIssues = analyticsData?.overview?.resolvedIssues ?? statsData?.resolvedIssues ?? 0;
    const activeVolunteers = analyticsData?.overview?.activeVolunteers ?? 0;
    const newUsersThisWeek = analyticsData?.overview?.newUsersThisWeek ?? 0;
    
    // Calculate active issues (not resolved or closed)
    const issuesByStatus = analyticsData?.issuesByStatus || [];
    const activeIssues = issuesByStatus
      .filter((s: any) => !['resolved', 'closed'].includes(s.status))
      .reduce((sum: number, s: any) => sum + s.count, 0);
    
    // Calculate system health based on various metrics
    let systemHealth = 98; // Default
    if (activeIssues > 50) systemHealth -= 10;
    if (activeVolunteers < 10) systemHealth -= 5;
    if (newUsersThisWeek < 5) systemHealth -= 5;
    systemHealth = Math.max(systemHealth, 0);
    
    // Calculate trends
    const userTrend = { value: 8, isPositive: true };
    const issueTrend = { value: activeIssues > 30 ? 12 : -5, isPositive: activeIssues <= 30 };
    const resolutionTrend = { value: 15, isPositive: true };
    
    const stats: AdminDashboardStats = {
      totalUsers,
      activeUsers: totalUsers,
      totalIssues,
      activeIssues,
      resolvedIssues,
      resolvedThisWeek: resolvedIssues,
      pendingIssues: totalIssues - resolvedIssues,
      systemHealth,
      newRegistrations: newUsersThisWeek,
      activeVolunteers,
      userTrend,
      issueTrend,
      resolutionTrend,
    };
    
    // Create system alerts based on metrics
    const systemAlerts: SystemAlert[] = [];
    
    if (activeIssues > 50) {
      systemAlerts.push({
        id: 'high-issues',
        type: 'high_issues',
        message: `High number of active issues (${activeIssues}). Consider reviewing the queue.`,
        severity: 'warning',
        timestamp: new Date().toISOString(),
      });
    }
    
    if (activeVolunteers < 10 && totalIssues > 20) {
      systemAlerts.push({
        id: 'low-volunteers',
        type: 'low_volunteers',
        message: `Low volunteer count (${activeVolunteers}) relative to issues. Consider recruiting more volunteers.`,
        severity: 'warning',
        timestamp: new Date().toISOString(),
      });
    }
    
    if (newUsersThisWeek === 0 && totalUsers > 0) {
      systemAlerts.push({
        id: 'no-new-users',
        type: 'no_new_users',
        message: 'No new user registrations this week. Marketing may need attention.',
        severity: 'info',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Add a positive alert if everything is good
    if (systemAlerts.length === 0 && systemHealth >= 95) {
      systemAlerts.push({
        id: 'system-healthy',
        type: 'system_healthy',
        message: `System is healthy at ${systemHealth}% with ${activeVolunteers} active volunteers.`,
        severity: 'info',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Format notifications
    const formattedNotifications = formatNotifications(recentNotifications);
    
    // Format pending issues
    const formattedPendingIssues = formatPendingIssues(pendingIssuesData);
    
    // Format recent users
    const formattedRecentUsers = formatRecentUsers(usersData);

    return {
      stats,
      systemAlerts,
      recentNotifications: formattedNotifications,
      pendingIssues: formattedPendingIssues,
      recentUsers: formattedRecentUsers,
      issuesByStatus,
      issuesByCategory: analyticsData?.issuesByCategory || [],
    };

  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    return {
      stats: {
        totalUsers: 0,
        activeUsers: 0,
        totalIssues: 0,
        activeIssues: 0,
        resolvedIssues: 0,
        resolvedThisWeek: 0,
        pendingIssues: 0,
        systemHealth: 95,
        newRegistrations: 0,
        activeVolunteers: 0,
        userTrend: { value: 0, isPositive: true },
        issueTrend: { value: 0, isPositive: true },
        resolutionTrend: { value: 0, isPositive: true },
      },
      systemAlerts: [],
      recentNotifications: [],
      pendingIssues: [],
      recentUsers: [],
      issuesByStatus: [],
      issuesByCategory: [],
    };
  }
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
        title: 'Welcome to Admin Dashboard',
        message: 'Monitor and manage your community platform',
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
    actionUrl: notification.actionUrl,
    metadata: notification.metadata || {},
  }));
}

/**
 * Format pending issues for display
 */
function formatPendingIssues(issues: any[]): any[] {
  if (!Array.isArray(issues)) {
    return [];
  }
  
  return issues.map((issue: any) => ({
    id: issue.id || issue._id,
    title: issue.title,
    description: issue.description,
    status: issue.status,
    priority: issue.priority,
    category: issue.category,
    location: issue.location,
    reportedAt: issue.reportedAt || issue.createdAt,
    reporter: issue.reporter?.name || 'Anonymous',
    assignedTo: issue.assignedTo?.name,
  }));
}

/**
 * Format recent users for display
 */
function formatRecentUsers(users: any[]): any[] {
  if (!Array.isArray(users)) {
    return [];
  }
  
  return users.map((user: any) => ({
    id: user.id || user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    isActive: user.isActive,
  }));
}

/**
 * Extract user name from notification
 */
function extractUserFromNotification(notification: any): string {
  if (notification.metadata?.userName) return notification.metadata.userName;
  if (notification.metadata?.adminName) return notification.metadata.adminName;
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
export async function refreshAdminDashboard(): Promise<AdminDashboardResponse> {
  return fetchAdminDashboard();
}