import {
  issuesAPI,
  usersAPI,
  volunteersAPI,
  notificationsAPI,
  analyticsAPI,
} from '@/lib/services/api/endpoints';
import { unwrapArray, formatNotifications, sortAndSliceByDate } from './dashboardUtils';
import { VolunteerDashboardStats, VolunteerDashboardResponse, Assignment, AvailableTask } from '@/types/volunteer.types';

const EMPTY_STATS: VolunteerDashboardStats = Object.freeze({
  completedTasks:         0,
  activeTasks:            0,
  totalClaimed:           0,
  responseTime:           'N/A',
  rating:                 '0.0',
  communityRank:          'Volunteer',
  points:                 0,
  level:                  1,
  averageResolutionHours: 0,
});

const EMPTY_COMMUNITY_STATS = Object.freeze({
  totalVolunteers:     0,
  activeVolunteers:    0,
  totalIssuesResolved: 0,
  averageRating:       0,
});

const EMPTY_ARRAY = Object.freeze([]) as unknown as any[];

const EMPTY_RESPONSE: VolunteerDashboardResponse = Object.freeze({
  stats:               EMPTY_STATS,
  myAssignments:       EMPTY_ARRAY,
  availableTasks:      EMPTY_ARRAY,
  recentNotifications: EMPTY_ARRAY,
  communityStats:      EMPTY_COMMUNITY_STATS,
});

const STATUS_PROGRESS: Record<string, number> = Object.freeze({
  assigned:       25,
  in_progress:    50,
  pending_review: 75,
  resolved:       100,
});

export async function fetchVolunteerDashboard(
  userId: string
): Promise<VolunteerDashboardResponse> {
  try {
    const [
      userProfile,
      assignmentsRes,
      tasksRes,
      notificationsRes,
      analyticsRes,
    ] = await Promise.all([
      usersAPI.getUser(userId).catch(() => ({ data: null })),
      volunteersAPI.getMyAssignments().catch(() => ({ data: { assignments: [] } })),
      issuesAPI.getAvailableTasks().catch(() => ({ data: { tasks: [] } })),
      notificationsAPI.getNotifications().catch(() => ({ data: { notifications: [] } })),
      analyticsAPI.getOverview({ timeframe: 'month' }).catch(() => ({ data: null })),
    ]);

    const userData      = userProfile.data;
    const analyticsData = analyticsRes.data;

    const assignmentsData  = unwrapArray(assignmentsRes.data,  'assignments');
    const tasksData        = unwrapArray(tasksRes.data,        'tasks');
    const notificationsRaw = unwrapArray(notificationsRes.data, 'notifications');

    const recentRaw = sortAndSliceByDate(notificationsRaw, 'createdAt', 10);

    const volunteerStats = userData?.volunteerStats || {};
    const userStats      = userData?.stats          || {};

    const completedTasks = volunteerStats.tasksCompleted || 0;

    let activeTasks = 0;
    const completedAssignments: any[] = [];

    for (const a of assignmentsData) {
      if (a.status === 'assigned' || a.status === 'in_progress') {
        activeTasks++;
      }
      if (a.status === 'resolved' && a.claimedAt && a.updatedAt) {
        completedAssignments.push(a);
      }
    }

    const totalClaimed = volunteerStats.totalClaimed || 0;

    let avgResolutionHours = 0;
    if (completedAssignments.length > 0) {
      const totalHours = completedAssignments.reduce((sum: number, a: any) => {
        return (
          sum +
          (new Date(a.updatedAt).getTime() - new Date(a.claimedAt).getTime()) /
            3_600_000
        );
      }, 0);
      avgResolutionHours = Math.round(totalHours / completedAssignments.length);
    }

    const responseTime =
      avgResolutionHours > 0
        ? avgResolutionHours < 24
          ? `${avgResolutionHours}h`
          : `${Math.round(avgResolutionHours / 24)}d`
        : 'N/A';

    const rating = volunteerStats.averageRating || '0.0';
    const points = userStats.points || 0;
    const level  = userStats.level  || 1;

    const activeVolunteers    = analyticsData?.overview?.activeVolunteers  ?? 0;
    const totalIssuesResolved = analyticsData?.overview?.resolvedIssues    ?? 0;

    return {
      stats: {
        completedTasks,
        activeTasks,
        totalClaimed,
        responseTime,
        rating:        typeof rating === 'number' ? rating.toFixed(1) : rating,
        communityRank: calculateVolunteerRank(completedTasks),
        points,
        level,
        averageResolutionHours: avgResolutionHours,
      },
      myAssignments:       formatAssignments(assignmentsData.slice(0, 10)),
      availableTasks:      formatAvailableTasks(tasksData.slice(0, 10)),
      recentNotifications: formatNotifications(recentRaw, 'Welcome, Volunteer!'),
      communityStats: {
        totalVolunteers: activeVolunteers,
        activeVolunteers,
        totalIssuesResolved,
        averageRating: parseFloat(rating),
      },
    };
  } catch (error) {
    console.error('Error fetching volunteer dashboard:', error);
    return EMPTY_RESPONSE;
  }
}

export const refreshVolunteerDashboard = fetchVolunteerDashboard;

export function calculateVolunteerRank(completedTasks: number): string {
  if (completedTasks >= 100) return 'Hero Volunteer';
  if (completedTasks >= 50)  return 'Elite Volunteer';
  if (completedTasks >= 25)  return 'Senior Volunteer';
  if (completedTasks >= 10)  return 'Active Volunteer';
  if (completedTasks >= 5)   return 'Regular Volunteer';
  return 'Volunteer';
}

function formatAssignments(assignments: any[]): Assignment[] {
  if (!Array.isArray(assignments)) {
    console.warn('formatAssignments received non-array:', assignments);
    return [];
  }

  return assignments.map((a: any): Assignment => ({
    id:               a.id || a._id,
    taskId:           a.taskId || a.id,
    title:            a.title || 'Untitled',
    description:      a.description || '',
    category:         a.category || 'general',
    priority:         a.priority || 'medium',
    status:           a.status   || 'assigned',
    location:         a.location || '',
    claimedAt:        a.claimedAt || a.assignedAt || new Date().toISOString(),
    updatedAt:        a.updatedAt || new Date().toISOString(),
    progress:         STATUS_PROGRESS[a.status] ?? 0,
    reporter:         a.reporter || { name: a.reportedBy || 'Community Member' },
    resolutionNotes:  a.resolutionNotes,
    resolutionProof:  a.resolutionProof,
  }));
}

function formatAvailableTasks(tasks: any[]): AvailableTask[] {
  if (!Array.isArray(tasks)) {
    console.warn('formatAvailableTasks received non-array:', tasks);
    return [];
  }

  return tasks.map((t: any): AvailableTask => ({
    id:          t.id || t._id,
    title:       t.title || 'Untitled',
    description: t.description || '',
    category:    t.category || 'general',
    priority:    t.priority || 'medium',
    location:    t.location || '',
    reportedBy:  t.reporter?.name || t.reportedBy || 'Community Member',
    reportedAt:  t.reportedAt || t.createdAt || new Date().toISOString(),
    upvotes:     t.upvotes || 0,
    images:      t.images  || [],
    latitude:    t.latitude,
    longitude:   t.longitude,
    reporterId:  t.reporterId || t.reporter?.id || '',
    reporter:    t.reporter
      ? {
          id:     t.reporter.id || t.reporterId,
          name:   t.reporter.name || t.reportedBy || 'Community Member',
          avatar: t.reporter.avatar,
          email:  t.reporter.email,
          phone:  t.reporter.phone,
        }
      : undefined,
  }));
}