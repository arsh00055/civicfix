import { calculateVolunteerRank, fetchVolunteerDashboard } from '@/lib/helpers/volunteerDashboard.helper';
import {
    issuesAPI as issAPI2, usersAPI as usrAPI2,
    volunteersAPI, notificationsAPI as ntfAPI2, analyticsAPI as anlAPI2,
  } from '@/lib/services/api/endpoints';
  
  jest.mock('@/lib/services/api/endpoints', () => ({
    issuesAPI:        { getAvailableTasks: jest.fn() },
    usersAPI:         { getUser: jest.fn() },
    volunteersAPI:    { getMyAssignments: jest.fn() },
    notificationsAPI: { getNotifications: jest.fn() },
    analyticsAPI:     { getOverview: jest.fn() },
  }));
  
  const VOL_USER = { data: {
    volunteerStats: { tasksCompleted: 10, totalClaimed: 15, averageRating: 4.5 },
    stats:          { points: 500, level: 3 },
  }};
  const VOL_ASSIGNMENTS = { data: { assignments: [
    { id: 'a1', title: 'Fix light', status: 'in_progress', category: 'infrastructure',
      priority: 'high', location: 'Main St', claimedAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString() },
  ]}};
  const VOL_TASKS = { data: { tasks: [] } };
  const VOL_NOTIFICATIONS = { data: { notifications: [] } };
  const VOL_ANALYTICS = { data: { overview: { activeVolunteers: 25, resolvedIssues: 80 } } };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (usrAPI2.getUser as jest.Mock).mockResolvedValue(VOL_USER);
    (volunteersAPI.getMyAssignments as jest.Mock).mockResolvedValue(VOL_ASSIGNMENTS);
    (issAPI2.getAvailableTasks as jest.Mock).mockResolvedValue(VOL_TASKS);
    (ntfAPI2.getNotifications as jest.Mock).mockResolvedValue(VOL_NOTIFICATIONS);
    (anlAPI2.getOverview as jest.Mock).mockResolvedValue(VOL_ANALYTICS);
  });
  
  describe('fetchVolunteerDashboard', () => {
  
    test('returns completedTasks from user stats', async () => {
      const result = await fetchVolunteerDashboard('vol-1');
      expect(result.stats.completedTasks).toBe(10);
    });
  
    test('counts active tasks from assignments', async () => {
      const result = await fetchVolunteerDashboard('vol-1');
      expect(result.stats.activeTasks).toBe(1); // one in_progress
    });
  
    test('returns rating formatted to one decimal', async () => {
      const result = await fetchVolunteerDashboard('vol-1');
      expect(result.stats.rating).toBe('4.5');
    });
  
    test('returns points and level from user stats', async () => {
      const result = await fetchVolunteerDashboard('vol-1');
      expect(result.stats.points).toBe(500);
      expect(result.stats.level).toBe(3);
    });
  
    test('returns empty response on failure', async () => {
      (usrAPI2.getUser as jest.Mock).mockRejectedValue(new Error('fail'));
      (volunteersAPI.getMyAssignments as jest.Mock).mockRejectedValue(new Error('fail'));
      (issAPI2.getAvailableTasks as jest.Mock).mockRejectedValue(new Error('fail'));
      (ntfAPI2.getNotifications as jest.Mock).mockRejectedValue(new Error('fail'));
      (anlAPI2.getOverview as jest.Mock).mockRejectedValue(new Error('fail'));
  
      const result = await fetchVolunteerDashboard('vol-1');
      expect(result.stats.completedTasks).toBe(0);
    });
  
    test('formats assignments correctly', async () => {
      const result = await fetchVolunteerDashboard('vol-1');
      expect(result.myAssignments).toHaveLength(1);
      expect(result.myAssignments[0].title).toBe('Fix light');
    });
  });
  
  describe('calculateVolunteerRank', () => {
    test.each([
      [0,   'Volunteer'],
      [5,   'Regular Volunteer'],
      [10,  'Active Volunteer'],
      [25,  'Senior Volunteer'],
      [50,  'Elite Volunteer'],
      [100, 'Hero Volunteer'],
    ])('%d tasks → %s', (tasks, expected) => {
      expect(calculateVolunteerRank(tasks)).toBe(expected);
    });
  });