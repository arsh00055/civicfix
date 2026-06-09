import { fetchCitizenDashboard } from '@/lib/helpers/citizenDashboard.helper';
import {
    issuesAPI, usersAPI, achievementsAPI, notificationsAPI, analyticsAPI,
  } from '@/lib/services/api/endpoints';
  
  jest.mock('@/lib/services/api/endpoints', () => ({
    issuesAPI:       { getMyReports: jest.fn() },
    usersAPI:        { getUser: jest.fn() },
    achievementsAPI: { getUserAchievements: jest.fn() },
    notificationsAPI:{ getNotifications: jest.fn() },
    analyticsAPI:    { getOverview: jest.fn() },
  }));
  
  const BASE_USER = { data: { stats: { totalReports: 5, resolvedReports: 2, totalVotes: 10, totalComments: 3, points: 300 } } };
  const BASE_REPORTS = { data: [
    { id: 'r1', title: 'Issue 1', status: 'reported', priority: 'medium', category: 'safety',
      location: 'Main St', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'r2', title: 'Issue 2', status: 'resolved', priority: 'low', category: 'safety',
      location: 'Oak Ave', createdAt: new Date(Date.now() - 86400000).toISOString(),
      resolvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]};
  const BASE_NOTIFICATIONS = { data: { notifications: [] } };
  const BASE_ACHIEVEMENTS  = { data: [{ id: 'a1', unlockedAt: new Date().toISOString() }] };
  const BASE_ANALYTICS     = { data: { overview: { totalIssues: 100, resolvedIssues: 75, activeVolunteers: 20 } } };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (usersAPI.getUser as jest.Mock).mockResolvedValue(BASE_USER);
    (issuesAPI.getMyReports as jest.Mock).mockResolvedValue(BASE_REPORTS);
    (notificationsAPI.getNotifications as jest.Mock).mockResolvedValue(BASE_NOTIFICATIONS);
    (achievementsAPI.getUserAchievements as jest.Mock).mockResolvedValue(BASE_ACHIEVEMENTS);
    (analyticsAPI.getOverview as jest.Mock).mockResolvedValue(BASE_ANALYTICS);
  });
  
  describe('fetchCitizenDashboard', () => {
  
    test('returns stats with correct reportsSubmitted from user stats', async () => {
      const result = await fetchCitizenDashboard('user-1');
      expect(result.stats.reportsSubmitted).toBe(5);
    });
  
    test('returns stats with correct issuesResolved', async () => {
      const result = await fetchCitizenDashboard('user-1');
      expect(result.stats.issuesResolved).toBe(2);
    });
  
    test('counts unlocked achievements correctly', async () => {
      const result = await fetchCitizenDashboard('user-1');
      expect(result.stats.achievementsEarned).toBe(1);
    });
  
    test('calculates resolutionRate from analytics data', async () => {
      const result = await fetchCitizenDashboard('user-1');
      expect(result.stats.resolutionRate).toBe(75); // 75/100 * 100
    });
  
    test('returns myReports formatted correctly', async () => {
      const result = await fetchCitizenDashboard('user-1');
      expect(result.myReports).toHaveLength(2);
      expect(result.myReports[0].title).toBe('Issue 1');
    });
  
    test('returns empty response on total failure', async () => {
      (usersAPI.getUser as jest.Mock).mockRejectedValue(new Error('fail'));
      (issuesAPI.getMyReports as jest.Mock).mockRejectedValue(new Error('fail'));
      (notificationsAPI.getNotifications as jest.Mock).mockRejectedValue(new Error('fail'));
      (achievementsAPI.getUserAchievements as jest.Mock).mockRejectedValue(new Error('fail'));
      (analyticsAPI.getOverview as jest.Mock).mockRejectedValue(new Error('fail'));
  
      const result = await fetchCitizenDashboard('user-1');
      expect(result.stats.reportsSubmitted).toBe(0);
      expect(result.myReports).toHaveLength(0);
    });
  
    test('calculates communityRank based on points', async () => {
      const result = await fetchCitizenDashboard('user-1');
      // 300 points → 'Contributor' (≥100)
      expect(result.stats.communityRank).toBe('Contributor');
    });
  
    test('calculates communityImpact as percentage string', async () => {
      const result = await fetchCitizenDashboard('user-1');
      expect(result.stats.communityImpact).toMatch(/%/);
    });
  });