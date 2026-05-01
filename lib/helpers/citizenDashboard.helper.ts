import {
  issuesAPI,
  usersAPI,
  achievementsAPI,
  notificationsAPI,
  analyticsAPI,
} from '@/lib/services/api/endpoints';
import { unwrapArray, formatNotifications, sortAndSliceByDate } from './dashboardUtils';
import { CitizenDashboardResponse, CitizenDashboardStats } from '@/types/user.types';
import { Issue } from '@/types/issue.types';

const EMPTY_STATS: CitizenDashboardStats = Object.freeze({
  reportsSubmitted:      0,
  issuesResolved:        0,
  achievementsEarned:    0,
  communityRank:         'Citizen',
  communityImpact:       '0%',
  totalVotes:            0,
  totalComments:         0,
  activeVolunteers:      0,
  resolutionRate:        0,
  averageResolutionTime: 'N/A',
  pendingIssues:         0,
  totalCommunityIssues:  0,
  thisWeekReports:       0,
  thisWeekResolved:      0,
});

const EMPTY_COMMUNITY_STATS = Object.freeze({
  totalVolunteers:   0,
  activeVolunteers:  0,
  totalIssues:       0,
  resolvedIssues:    0,
  pendingIssues:     0,
  avgResolutionHours: 0,
});

// Frozen empty arrays reused on every error path — no allocation.
const EMPTY_ARRAY = Object.freeze([]) as unknown as any[];

const EMPTY_RESPONSE: CitizenDashboardResponse = Object.freeze({
  stats:               EMPTY_STATS,
  myReports:           EMPTY_ARRAY,
  recentNotifications: EMPTY_ARRAY,
  communityStats:      EMPTY_COMMUNITY_STATS,
});

// One week in ms — computed once at module load, not per call.
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;


export async function fetchCitizenDashboard(
  userId: string
): Promise<CitizenDashboardResponse> {
  try {
    const [
      userProfile,
      myReportsRes,
      notificationsRes,
      achievementsRes,
      analyticsRes,
    ] = await Promise.all([
      usersAPI.getUser(userId).catch(() => ({ data: null })),
      issuesAPI.getMyReports().catch(() => ({ data: [] })),
      notificationsAPI.getNotifications().catch(() => ({ data: { notifications: [] } })),
      achievementsAPI.getUserAchievements(userId).catch(() => ({ data: [] })),
      analyticsAPI.getOverview({ timeframe: 'month' }).catch(() => ({ data: null })),
    ]);

    const userData      = userProfile.data;
    const analyticsData = analyticsRes.data;

    const reportsData      = unwrapArray(myReportsRes.data,       'issues', 'reports');
    const notificationsRaw = unwrapArray(notificationsRes.data,   'notifications');
    const achievementsData = unwrapArray(achievementsRes.data,    'achievements');

    const recentRaw = sortAndSliceByDate(notificationsRaw, 'createdAt', 10);

    const totalIssues      = analyticsData?.overview?.totalIssues      ?? 0;
    const resolvedIssues   = analyticsData?.overview?.resolvedIssues   ?? 0;
    const activeVolunteers = analyticsData?.overview?.activeVolunteers ?? 0;

    const reportsSubmitted   = userData?.stats?.totalReports ?? reportsData.length;
    const issuesResolved     = userData?.stats?.resolvedReports ?? 0;
    const achievementsEarned = achievementsData.filter((a: any) => a.unlockedAt).length;
    const totalVotes         = userData?.stats?.totalVotes    ?? 0;
    const totalComments      = userData?.stats?.totalComments ?? 0;

    const oneWeekAgoMs  = Date.now() - ONE_WEEK_MS;
    const thisWeekReports  = reportsData.filter(
      (r: any) => new Date(r.createdAt).getTime() >= oneWeekAgoMs
    ).length;
    const thisWeekResolved = reportsData.filter(
      (r: any) =>
        r.status === 'resolved' &&
        new Date(r.resolvedAt || r.updatedAt).getTime() >= oneWeekAgoMs
    ).length;

    const resolutionRate =
      totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

    const resolvedReports = reportsData.filter(
      (r: any) => r.status === 'resolved' && r.resolvedAt && r.createdAt
    );

    let avgResolutionHours = 0;
    if (resolvedReports.length > 0) {
      const totalHours = resolvedReports.reduce((sum: number, r: any) => {
        return (
          sum +
          (new Date(r.resolvedAt).getTime() - new Date(r.createdAt).getTime()) /
            3_600_000
        );
      }, 0);
      avgResolutionHours = Math.round(totalHours / resolvedReports.length);
    }

    const averageResolutionTime =
      avgResolutionHours > 0
        ? avgResolutionHours < 24
          ? `${avgResolutionHours} hours`
          : `${Math.round(avgResolutionHours / 24)} days`
        : 'N/A';

    const pendingIssues = totalIssues - resolvedIssues;
    const points        = userData?.stats?.points ?? 0;

    const stats: CitizenDashboardStats = {
      reportsSubmitted,
      issuesResolved,
      achievementsEarned,
      communityRank:    calculateCommunityRank(points),
      communityImpact:  calculateCommunityImpact(points, reportsSubmitted),
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

    return {
      stats,
      myReports:           formatMyReports(reportsData.slice(0, 10), userId, userData?.name),
      recentNotifications: formatNotifications(recentRaw, 'Welcome to CivicFix!'),
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
    // FIX 5: return frozen constant — zero allocation on error path
    return EMPTY_RESPONSE;
  }
}

export const refreshCitizenDashboard = fetchCitizenDashboard;


function calculateCommunityRank(points: number): string {
  if (points >= 5000) return 'Community Legend';
  if (points >= 2000) return 'Top Contributor';
  if (points >= 1000) return 'Active Member';
  if (points >= 500)  return 'Rising Star';
  if (points >= 100)  return 'Contributor';
  return 'Citizen';
}

function calculateCommunityImpact(points: number, reportsSubmitted: number): string {
  if (points === 0 && reportsSubmitted === 0) return '0%';
  const reportImpact = Math.min(reportsSubmitted * 5, 50);
  const pointImpact  = Math.min(Math.floor(points / 100), 50);
  return `${Math.min(reportImpact + pointImpact, 100)}%`;
}

function formatMyReports(
  reports: any[],
  userId: string,
  userName?: string
): Issue[] {
  if (!Array.isArray(reports)) {
    console.warn('formatMyReports received non-array:', reports);
    return [];
  }

  return reports.map((r: any): Issue => ({
    id:            r.id || r._id,
    title:         r.title || 'Untitled',
    description:   r.description || '',
    status:        r.status || 'reported',
    priority:      r.priority || 'medium',
    category:      r.category || 'general',
    location:      r.location || '',
    latitude:      r.latitude ?? null,
    longitude:     r.longitude ?? null,
    images:        r.images || [],
    upvotes:       r.upvotes || 0,
    voters:        r.voters || [],
    views:         r.views || 0,
    commentsCount: r.commentsCount ?? r.comments?.length ?? 0,
    comments:      r.comments || [],
    reporterId:    r.reporterId || userId,
    reporter:      { id: userId, name: userName || 'You' },
    assignedTo:    r.assignedTo || null,
    createdAt:     r.createdAt  || new Date().toISOString(),
    updatedAt:     r.updatedAt  || r.createdAt || new Date().toISOString(),
    reportedAt:    r.reportedAt || r.createdAt || new Date().toISOString(),
  }));
}