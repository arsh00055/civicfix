import {
  usersAPI,
  issuesAPI,
  adminAPI,
  analyticsAPI,
  notificationsAPI,
} from '@/lib/services/api/endpoints';
import { unwrapArray, formatNotifications, sortAndSliceByDate } from './dashboardUtils';
import { AdminDashboardResponse, AdminDashboardStats, SystemAlert } from '@/types/admin.types';


const POSITIVE_TREND  = Object.freeze({ value: 0, isPositive: true });

const EMPTY_STATS: AdminDashboardStats = Object.freeze({
  totalUsers:       0,
  activeUsers:      0,
  totalIssues:      0,
  activeIssues:     0,
  resolvedIssues:   0,
  resolvedThisWeek: 0,
  pendingIssues:    0,
  systemHealth:     95,
  newRegistrations: 0,
  activeVolunteers: 0,
  userTrend:        POSITIVE_TREND,
  issueTrend:       POSITIVE_TREND,
  resolutionTrend:  POSITIVE_TREND,
});

const EMPTY_ARRAY = Object.freeze([]) as unknown as any[];

const EMPTY_RESPONSE: AdminDashboardResponse = Object.freeze({
  stats:               EMPTY_STATS,
  systemAlerts:        EMPTY_ARRAY,
  recentNotifications: EMPTY_ARRAY,
  pendingIssues:       EMPTY_ARRAY,
  recentUsers:         EMPTY_ARRAY,
  issuesByStatus:      EMPTY_ARRAY,
  issuesByCategory:    EMPTY_ARRAY,
});

const INACTIVE_STATUSES = new Set(['resolved', 'closed']);


export async function fetchAdminDashboard(): Promise<AdminDashboardResponse> {
  try {
    const [
      statsRes,
      analyticsRes,
      notificationsRes,
      pendingIssuesRes,
      usersRes,
    ] = await Promise.all([
      adminAPI.getStats().catch(() => ({ data: null })),
      analyticsAPI.getOverview({ timeframe: 'week' }).catch(() => ({ data: null })),
      notificationsAPI.getNotifications().catch(() => ({ data: { notifications: [] } })),
      issuesAPI.getIssues({ status: 'pending_review', limit: 10 }).catch(() => ({ data: { issues: [] } })),
      usersAPI.getUsers({ limit: 10 }).catch(() => ({ data: { users: [] } })),
    ]);

    const statsData     = statsRes.data;
    const analyticsData = analyticsRes.data;

    const notificationsRaw  = unwrapArray(notificationsRes.data, 'notifications');
    const pendingIssuesData = unwrapArray(pendingIssuesRes.data, 'issues');
    const usersData         = unwrapArray(usersRes.data,         'users');

    const recentRaw = sortAndSliceByDate(notificationsRaw, 'createdAt', 10);

    const totalUsers       = analyticsData?.overview?.totalUsers       ?? statsData?.totalUsers       ?? 0;
    const totalIssues      = analyticsData?.overview?.totalIssues      ?? statsData?.totalIssues      ?? 0;
    const resolvedIssues   = analyticsData?.overview?.resolvedIssues   ?? statsData?.resolvedIssues   ?? 0;
    const activeVolunteers = analyticsData?.overview?.activeVolunteers ?? 0;
    const newUsersThisWeek = analyticsData?.overview?.newUsersThisWeek ?? 0;

    const issuesByStatus: { status: string; count: number }[] =
      analyticsData?.issuesByStatus || [];

    const activeIssues = issuesByStatus
      .filter((s) => !INACTIVE_STATUSES.has(s.status))
      .reduce((sum, s) => sum + s.count, 0);

    let systemHealth = 98;
    if (activeIssues > 50)     systemHealth -= 10;
    if (activeVolunteers < 10) systemHealth -= 5;
    if (newUsersThisWeek < 5)  systemHealth -= 5;
    systemHealth = Math.max(systemHealth, 0);

    return {
      stats: {
        totalUsers,
        activeUsers:      totalUsers,
        totalIssues,
        activeIssues,
        resolvedIssues,
        resolvedThisWeek: resolvedIssues,
        pendingIssues:    totalIssues - resolvedIssues,
        systemHealth,
        newRegistrations: newUsersThisWeek,
        activeVolunteers,
        userTrend:        Object.freeze({ value: 8, isPositive: true }),
        issueTrend:       Object.freeze({ value: activeIssues > 30 ? 12 : -5, isPositive: activeIssues <= 30 }),
        resolutionTrend:  Object.freeze({ value: 15, isPositive: true }),
      },
      systemAlerts: buildSystemAlerts(
        activeIssues,
        activeVolunteers,
        newUsersThisWeek,
        totalUsers,
        systemHealth
      ),
      recentNotifications: formatNotifications(recentRaw, 'Welcome to Admin Dashboard'),
      pendingIssues:        formatPendingIssues(pendingIssuesData),
      recentUsers:          formatRecentUsers(usersData),
      issuesByStatus,
      issuesByCategory:     analyticsData?.issuesByCategory || [],
    };
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    return EMPTY_RESPONSE;
  }
}

export const refreshAdminDashboard = fetchAdminDashboard;

function buildSystemAlerts(
  activeIssues: number,
  activeVolunteers: number,
  newUsersThisWeek: number,
  totalUsers: number,
  systemHealth: number
): SystemAlert[] {
  const alerts: SystemAlert[] = [];
  const now = new Date().toISOString(); // single allocation for all alerts

  if (activeIssues > 50) {
    alerts.push({
      id:        'high-issues',
      type:      'high_issues',
      severity:  'warning',
      message:   `High number of active issues (${activeIssues}). Consider reviewing the queue.`,
      timestamp: now,
    });
  }

  if (activeVolunteers < 10 && totalUsers > 20) {
    alerts.push({
      id:        'low-volunteers',
      type:      'low_volunteers',
      severity:  'warning',
      message:   `Low volunteer count (${activeVolunteers}). Consider recruiting more volunteers.`,
      timestamp: now,
    });
  }

  if (newUsersThisWeek === 0 && totalUsers > 0) {
    alerts.push({
      id:        'no-new-users',
      type:      'no_new_users',
      severity:  'info',
      message:   'No new user registrations this week. Marketing may need attention.',
      timestamp: now,
    });
  }

  if (alerts.length === 0 && systemHealth >= 95) {
    alerts.push({
      id:        'system-healthy',
      type:      'system_healthy',
      severity:  'info',
      message:   `System is healthy at ${systemHealth}% with ${activeVolunteers} active volunteers.`,
      timestamp: now,
    });
  }

  return alerts;
}

function formatPendingIssues(issues: any[]): any[] {
  if (!Array.isArray(issues)) return [];
  return issues.map((i: any) => ({
    id:          i.id || i._id,
    title:       i.title,
    description: i.description,
    status:      i.status,
    priority:    i.priority,
    category:    i.category,
    location:    i.location,
    reportedAt:  i.reportedAt || i.createdAt,
    reporter:    i.reporter?.name || 'Anonymous',
    assignedTo:  i.assignedTo?.name,
  }));
}

function formatRecentUsers(users: any[]): any[] {
  if (!Array.isArray(users)) return [];
  return users.map((u: any) => ({
    id:        u.id || u._id,
    name:      u.name,
    email:     u.email,
    role:      u.role,
    avatar:    u.avatar,
    createdAt: u.createdAt,
    isActive:  u.isActive,
  }));
}