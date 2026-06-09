// ─────────────────────────────────────────────────────────────────────────────
// __tests__/services/adminDashboard.test.ts
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @jest-environment node
 */
import { fetchAdminDashboard } from '@/lib/helpers/adminDashboard.helper';
import {
    usersAPI as uAPI3, issuesAPI as iAPI3, adminAPI,
    analyticsAPI as aAPI3, notificationsAPI as nAPI3,
  } from '@/lib/services/api/endpoints';
  
  jest.mock('@/lib/services/api/endpoints', () => ({
    usersAPI:         { getUsers: jest.fn() },
    issuesAPI:        { getIssues: jest.fn() },
    adminAPI:         { getStats: jest.fn() },
    analyticsAPI:     { getOverview: jest.fn() },
    notificationsAPI: { getNotifications: jest.fn() },
  }));
  
  const ADM_STATS     = { data: { totalUsers: 50, totalIssues: 100, resolvedIssues: 70 } };
  const ADM_ANALYTICS = { data: {
    overview: { totalUsers: 50, totalIssues: 100, resolvedIssues: 70, activeVolunteers: 15, newUsersThisWeek: 5 },
    issuesByStatus:   [{ status: 'reported', count: 20 }, { status: 'in_progress', count: 10 }],
    issuesByCategory: [{ category: 'infrastructure', count: 30 }],
  }};
  const ADM_NOTIFICATIONS = { data: { notifications: [] } };
  const ADM_ISSUES    = { data: { issues: [] } };
  const ADM_USERS     = { data: { users: [] } };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (adminAPI.getStats as jest.Mock).mockResolvedValue(ADM_STATS);
    (aAPI3.getOverview as jest.Mock).mockResolvedValue(ADM_ANALYTICS);
    (nAPI3.getNotifications as jest.Mock).mockResolvedValue(ADM_NOTIFICATIONS);
    (iAPI3.getIssues as jest.Mock).mockResolvedValue(ADM_ISSUES);
    (uAPI3.getUsers as jest.Mock).mockResolvedValue(ADM_USERS);
  });
  
  describe('fetchAdminDashboard', () => {
  
    test('returns totalUsers from analytics', async () => {
      const result = await fetchAdminDashboard();
      expect(result.stats.totalUsers).toBe(50);
    });
  
    test('returns totalIssues from analytics', async () => {
      const result = await fetchAdminDashboard();
      expect(result.stats.totalIssues).toBe(100);
    });
  
    test('returns resolvedIssues from analytics', async () => {
      const result = await fetchAdminDashboard();
      expect(result.stats.resolvedIssues).toBe(70);
    });
  
    test('calculates activeIssues from non-resolved statuses', async () => {
      const result = await fetchAdminDashboard();
      // reported(20) + in_progress(10) = 30 active
      expect(result.stats.activeIssues).toBe(30);
    });
  
    test('returns systemAlerts array', async () => {
      const result = await fetchAdminDashboard();
      expect(Array.isArray(result.systemAlerts)).toBe(true);
    });
  
    test('adds healthy alert when no issues and health >= 95', async () => {
      const result = await fetchAdminDashboard();
      // Only 30 active issues (< 50 threshold), 15 volunteers (≥ 10) — healthy
      const hasHealthy = result.systemAlerts.some(a => a.type === 'system_healthy');
      expect(hasHealthy).toBe(true);
    });
  
    test('adds high issues alert when activeIssues > 50', async () => {
      (aAPI3.getOverview as jest.Mock).mockResolvedValue({
        data: {
          overview: { totalUsers: 50, totalIssues: 200, resolvedIssues: 100, activeVolunteers: 15, newUsersThisWeek: 5 },
          issuesByStatus: [{ status: 'reported', count: 60 }],
          issuesByCategory: [],
        }
      });
      const result = await fetchAdminDashboard();
      expect(result.systemAlerts.some(a => a.type === 'high_issues')).toBe(true);
    });
  
    test('returns empty response on total failure', async () => {
      (adminAPI.getStats as jest.Mock).mockRejectedValue(new Error('fail'));
      (aAPI3.getOverview as jest.Mock).mockRejectedValue(new Error('fail'));
      (nAPI3.getNotifications as jest.Mock).mockRejectedValue(new Error('fail'));
      (iAPI3.getIssues as jest.Mock).mockRejectedValue(new Error('fail'));
      (uAPI3.getUsers as jest.Mock).mockRejectedValue(new Error('fail'));
  
      const result = await fetchAdminDashboard();
      expect(result.stats.totalUsers).toBe(0);
      expect(result.systemAlerts).toHaveLength(0);
    });
  
    test('returns issuesByStatus from analytics', async () => {
      const result = await fetchAdminDashboard();
      expect(result.issuesByStatus).toHaveLength(2);
    });
  });