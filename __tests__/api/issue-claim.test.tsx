import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { makeRequest, mockFindOne, mockUpdateOne } from '../db/mongodb';
import { NextRequest } from 'next/server';

jest.mock('@/lib/auth/getCurrentUser', () => ({
    getCurrentUser: jest.fn(),
}));
  
jest.mock('@/lib/services/achievementService', () => ({
    checkAndAwardAchievements: jest.fn().mockResolvedValue({}),
}));

jest.mock('@/lib/helpers/notification.helper', () => ({
    notifyIssueClaimed:          jest.fn().mockResolvedValue(undefined),
    notifyVolunteerTaskClaimed:  jest.fn().mockResolvedValue(undefined),
    notifyAdminIssueClaimed:     jest.fn().mockResolvedValue(undefined),
    notifyReporterNewComment:    jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/helpers/userStats.helper', () => ({
    updateUserStatsAndCheckAchievements: jest.fn().mockResolvedValue(undefined),
}));

describe('POST /api/issues/[id]/claim', () => {
    let POST: (req: NextRequest, ctx: any) => Promise<Response>;
  
    // Valid ObjectId for MongoDB
    const ISSUE_ID = '507f1f77bcf86cd799439011';
    const VOLUNTEER_ID = '507f1f77bcf86cd799439012';
  
    const mockParams = { params: Promise.resolve({ id: ISSUE_ID }) };
  
    beforeAll(async () => {
      ({ POST } = await import('@/app/api/issues/[id]/claim/route'));
    });
  
    beforeEach(() => {
      jest.clearAllMocks();
      (getCurrentUser as jest.Mock).mockReturnValue({
        id:   VOLUNTEER_ID,
        role: 'volunteer',
        name: 'Arshdeep Singh',
      });
    });
  
    // ── Auth ──────────────────────────────────────────────────────────────────
    test('returns 401 when user is not authenticated', async () => {
      (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
      const res = await POST(makeRequest({}), mockParams);
      expect(res.status).toBe(401);
    });
  
    test('returns 403 when user is a citizen', async () => {
      (getCurrentUser as jest.Mock).mockReturnValueOnce({ id: 'c1', role: 'citizen', name: 'Citizen' });
      const res = await POST(makeRequest({}), mockParams);
      expect(res.status).toBe(403);
      expect((await res.json()).message).toMatch(/only volunteers/i);
    });
  
    // ── Issue state validation ───────────────────────────────────────────────
    test('returns 404 when issue does not exist', async () => {
      mockFindOne.mockResolvedValueOnce(null);
      const res = await POST(makeRequest({}), mockParams);
      expect(res.status).toBe(404);
    });
  
    test('returns 409 when issue is already assigned', async () => {
      mockFindOne.mockResolvedValueOnce({
        _id:          ISSUE_ID,
        status:       'reported',
        assignedToId: VOLUNTEER_ID, // already claimed
        title:        'Pothole',
        reporter:     { name: 'Reporter' },
      });
      const res = await POST(makeRequest({}), mockParams);
      expect(res.status).toBe(409);
      expect((await res.json()).message).toMatch(/already assigned/i);
    });
  
    test('returns 409 when issue status is in_progress', async () => {
      mockFindOne.mockResolvedValueOnce({
        _id:          ISSUE_ID,
        status:       'in_progress', // cannot be claimed
        assignedToId: null,
        title:        'Pothole',
        reporter:     { name: 'Reporter' },
      });
      const res = await POST(makeRequest({}), mockParams);
      expect(res.status).toBe(409);
      expect((await res.json()).message).toMatch(/cannot be claimed/i);
    });
  
    // ── Successful claim ─────────────────────────────────────────────────────
    test('returns 200 and updates issue status to assigned', async () => {
      const mockIssue = {
        _id:          ISSUE_ID,
        status:       'reported',
        assignedToId: null,
        title:        'Broken Street Light',
        reporter:     { name: 'Jaspreet' },
        priority:     'high',
      };
  
      mockFindOne
        .mockResolvedValueOnce(mockIssue)                       // issue lookup
        .mockResolvedValueOnce({ stats: { points: 15 }, volunteerStats: { totalClaimed: 1 } }) // volunteer after update
        .mockResolvedValueOnce({ ...mockIssue, status: 'assigned', assignedToId: VOLUNTEER_ID }) // issue after update
      ;
      mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
  
      const res = await POST(makeRequest({}), mockParams);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.pointsAwarded).toBe(15);
      expect(body.message).toMatch(/claimed successfully/i);
    });
  
    test('sets assignedAt timestamp when claiming', async () => {
      const mockIssue = {
        _id: ISSUE_ID, status: 'reported', assignedToId: null,
        title: 'Light out', reporter: { name: 'J' }, priority: 'medium',
      };
      mockFindOne
        .mockResolvedValueOnce(mockIssue)
        .mockResolvedValueOnce({ stats: {}, volunteerStats: {} })
        .mockResolvedValueOnce({ ...mockIssue, _id: ISSUE_ID, status: 'assigned' })
      ;
      mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
  
      await POST(makeRequest({}), mockParams);
  
      const issueUpdate = mockUpdateOne.mock.calls[0][1].$set;
      expect(issueUpdate.assignedAt).toBeDefined();
      expect(issueUpdate.status).toBe('assigned');
    });
});
  