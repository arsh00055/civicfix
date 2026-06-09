import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;
 
import {
  mockDb,
  mockFindOne,
  mockUpdateOne,
  mockInsertOne,
  mockFind,
  mockChain,
} from '../db/mongodb';
 
jest.mock('@/lib/auth/getCurrentUser', () => ({ getCurrentUser: jest.fn() }));
jest.mock('@/lib/email', () => ({ sendEmail: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/lib/services/achievementService', () => ({
  checkAndAwardAchievements: jest.fn().mockResolvedValue({ newlyUnlocked: [], pointsAwarded: 0 }),
}));
jest.mock('@/lib/helpers/notification.helper', () => ({
  notifyVolunteerWarning:     jest.fn().mockResolvedValue(undefined),
  notifyIssueReassigned:      jest.fn().mockResolvedValue(undefined),
  notifyAllVolunteersNewTask: jest.fn().mockResolvedValue(undefined),
}));
 
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { sendEmail } from '@/lib/email';
import { checkAndAwardAchievements } from '@/lib/services/achievementService';
 
const ADMIN_ID     = '507f1f77bcf86cd799439010';
const VOL_ID       = '507f1f77bcf86cd799439020';
const ISSUE_ID     = '507f1f77bcf86cd799439030';
 
let consoleSpy: jest.SpyInstance;
 
beforeEach(() => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
 
  (getCurrentUser as jest.Mock).mockReturnValue({
    id: ADMIN_ID, role: 'admin', name: 'Admin User',
  });
 
  mockChain.sort.mockReturnThis();
  mockChain.toArray.mockResolvedValue([]);
  mockFind.mockReturnValue(mockChain);
  mockFindOne.mockResolvedValue(null);
  mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
  mockInsertOne.mockResolvedValue({ acknowledged: true, insertedId: 'new-id' });
 
  mockDb.collection.mockReturnValue({
    find:      mockFind,
    findOne:   mockFindOne,
    updateOne: mockUpdateOne,
    insertOne: mockInsertOne,
  });
});
 
afterEach(() => consoleSpy.mockRestore());
 
function makePost(url: string, body: object = {}): NextRequest {
  return new NextRequest(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
}
 
 
// ═════════════════════════════════════════════════════════════════════════════
// POST /api/admin/volunteers/[id]/approve
// ═════════════════════════════════════════════════════════════════════════════
describe('POST /api/admin/volunteers/[id]/approve', () => {
  let POST: (req: NextRequest, ctx: any) => Promise<Response>;
 
  const mockParams = { params: Promise.resolve({ id: VOL_ID }) };
 
  const MOCK_VOLUNTEER = {
    _id:            { toString: () => VOL_ID },
    name:           'Arshdeep Singh',
    email:          'arshdeep@test.com',
    approvalStatus: 'pending',
    isActive:       false,
    role:           'volunteer',
  };
 
  beforeAll(async () => {
    ({ POST } = await import('@/app/api/admin/volunteers/[id]/approve/route'));
  });
 
  test('returns 401 when not authenticated', async () => {
    (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
    const res = await POST(makePost(`/api/admin/volunteers/${VOL_ID}/approve`), mockParams);
    expect(res.status).toBe(401);
  });
 
  test('returns 401 when user is not admin', async () => {
    (getCurrentUser as jest.Mock).mockReturnValueOnce({
      id: 'citizen-1', role: 'citizen', name: 'Jaspreet',
    });
    const res = await POST(makePost(`/api/admin/volunteers/${VOL_ID}/approve`), mockParams);
    expect(res.status).toBe(401);
  });
 
  test('returns 400 for invalid volunteer ID', async () => {
    const badParams = { params: Promise.resolve({ id: 'not-valid' }) };
    const res = await POST(makePost('/api/admin/volunteers/not-valid/approve'), badParams);
    expect(res.status).toBe(400);
  });
 
  test('returns 404 when volunteer not found', async () => {
    mockFindOne.mockResolvedValueOnce(null);
    const res = await POST(makePost(`/api/admin/volunteers/${VOL_ID}/approve`), mockParams);
    expect(res.status).toBe(404);
  });
 
  test('returns 400 when volunteer is already approved', async () => {
    mockFindOne.mockResolvedValueOnce({ ...MOCK_VOLUNTEER, approvalStatus: 'approved' });
    const res = await POST(makePost(`/api/admin/volunteers/${VOL_ID}/approve`), mockParams);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/already approved/i);
  });
 
  test('returns 200 and approves volunteer successfully', async () => {
    // findOne: volunteer, then admin (for stats)
    mockFindOne
      .mockResolvedValueOnce(MOCK_VOLUNTEER)
      .mockResolvedValueOnce({ stats: { usersManaged: 1, level: 1, points: 50 } });
 
    const res  = await POST(makePost(`/api/admin/volunteers/${VOL_ID}/approve`), mockParams);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toMatch(/approved/i);
  });
 
  test('sets approvalStatus to approved and isActive to true', async () => {
    mockFindOne
      .mockResolvedValueOnce(MOCK_VOLUNTEER)
      .mockResolvedValueOnce({ stats: { usersManaged: 1, level: 1, points: 50 } });
 
    await POST(makePost(`/api/admin/volunteers/${VOL_ID}/approve`), mockParams);
 
    const updateArg = mockUpdateOne.mock.calls[0][1];
    expect(updateArg.$set.approvalStatus).toBe('approved');
    expect(updateArg.$set.isActive).toBe(true);
    expect(updateArg.$set.status).toBe('available');
  });
 
  test('sends approval email to volunteer', async () => {
    mockFindOne
      .mockResolvedValueOnce(MOCK_VOLUNTEER)
      .mockResolvedValueOnce({ stats: { usersManaged: 1 } });
 
    await POST(makePost(`/api/admin/volunteers/${VOL_ID}/approve`), mockParams);
 
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to:      'arshdeep@test.com',
        subject: expect.stringMatching(/approved/i),
      })
    );
  });
 
  test('still approves volunteer even if email sending fails', async () => {
    (sendEmail as jest.Mock).mockRejectedValueOnce(new Error('SMTP down'));
    mockFindOne
      .mockResolvedValueOnce(MOCK_VOLUNTEER)
      .mockResolvedValueOnce({ stats: { usersManaged: 1 } });
 
    const res = await POST(makePost(`/api/admin/volunteers/${VOL_ID}/approve`), mockParams);
    // Email fail should not block approval
    expect(res.status).toBe(200);
  });
 
  test('checks and awards admin achievements after approval', async () => {
    mockFindOne
      .mockResolvedValueOnce(MOCK_VOLUNTEER)
      .mockResolvedValueOnce({ stats: { usersManaged: 5, level: 2, points: 200 } });
 
    await POST(makePost(`/api/admin/volunteers/${VOL_ID}/approve`), mockParams);
 
    expect(checkAndAwardAchievements).toHaveBeenCalledWith(
      ADMIN_ID,
      'admin',
      expect.objectContaining({ usersManaged: 5 })
    );
  });
 
  test('returns 500 on DB error', async () => {
    mockFindOne.mockRejectedValueOnce(new Error('DB crash'));
    const res = await POST(makePost(`/api/admin/volunteers/${VOL_ID}/approve`), mockParams);
    expect(res.status).toBe(500);
  });
});
 
 
// ═════════════════════════════════════════════════════════════════════════════
// POST /api/admin/issues/[id]/escalate
// ═════════════════════════════════════════════════════════════════════════════
describe('POST /api/admin/issues/[id]/escalate', () => {
  let POST: (req: NextRequest, ctx: any) => Promise<Response>;
 
  const mockParams = { params: Promise.resolve({ id: ISSUE_ID }) };
 
  const MOCK_ISSUE = {
    _id:          { toString: () => ISSUE_ID },
    title:        'Broken Street Light',
    status:       'assigned',
    priority:     'medium',
    assignedToId: VOL_ID,
    assignedTo:   { id: VOL_ID, name: 'Arshdeep Singh', role: 'volunteer' },
    assignedAt:   new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    location:     '456 Oak Ave',
    createdAt:    new Date().toISOString(),
  };
 
  beforeAll(async () => {
    ({ POST } = await import('@/app/api/admin/issues/[id]/escalate/route'));
  });
 
  test('returns 401 when unauthenticated', async () => {
    (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
    const res = await POST(
      makePost(`/api/admin/issues/${ISSUE_ID}/escalate`, { action: 'close' }),
      mockParams
    );
    expect(res.status).toBe(401);
  });
 
  test('returns 403 when user is not admin', async () => {
    (getCurrentUser as jest.Mock).mockReturnValueOnce({
      id: VOL_ID, role: 'volunteer', name: 'Vol',
    });
    const res = await POST(
      makePost(`/api/admin/issues/${ISSUE_ID}/escalate`, { action: 'close' }),
      mockParams
    );
    expect(res.status).toBe(403);
  });
 
  test('returns 400 for invalid issue ID', async () => {
    const badParams = { params: Promise.resolve({ id: 'not-valid' }) };
    const res = await POST(
      makePost('/api/admin/issues/not-valid/escalate', { action: 'close' }),
      badParams
    );
    expect(res.status).toBe(400);
  });
 
  test('returns 404 when issue not found', async () => {
    mockFindOne.mockResolvedValueOnce(null);
    const res = await POST(
      makePost(`/api/admin/issues/${ISSUE_ID}/escalate`, { action: 'close' }),
      mockParams
    );
    expect(res.status).toBe(404);
  });
 
  test('returns 400 for unknown action', async () => {
    mockFindOne.mockResolvedValueOnce(MOCK_ISSUE);
    const res = await POST(
      makePost(`/api/admin/issues/${ISSUE_ID}/escalate`, { action: 'magic' }),
      mockParams
    );
    expect(res.status).toBe(400);
  });
 
  // ── close action ────────────────────────────────────────────────────────────
  describe('action: close', () => {
    test('closes the issue and returns 200', async () => {
      mockFindOne
        .mockResolvedValueOnce(MOCK_ISSUE)               // issue lookup
        .mockResolvedValueOnce({ ...MOCK_ISSUE, status: 'closed' }); // updated issue
 
      const res  = await POST(
        makePost(`/api/admin/issues/${ISSUE_ID}/escalate`, { action: 'close', reason: 'Invalid' }),
        mockParams
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toMatch(/closed/i);
    });
 
    test('sets status to closed and records closedBy', async () => {
      mockFindOne
        .mockResolvedValueOnce(MOCK_ISSUE)
        .mockResolvedValueOnce({ ...MOCK_ISSUE, status: 'closed' });
 
      await POST(
        makePost(`/api/admin/issues/${ISSUE_ID}/escalate`, { action: 'close' }),
        mockParams
      );
 
      const updateArg = mockUpdateOne.mock.calls[0][1];
      expect(updateArg.$set.status).toBe('closed');
      expect(updateArg.$set.closedBy).toBe(ADMIN_ID);
    });
  });
 
  // ── bump_priority action ────────────────────────────────────────────────────
  describe('action: bump_priority', () => {
    test('bumps medium to high and returns 200', async () => {
      mockFindOne
        .mockResolvedValueOnce({ ...MOCK_ISSUE, priority: 'medium' })
        .mockResolvedValueOnce({ ...MOCK_ISSUE, priority: 'high' });
 
      const res  = await POST(
        makePost(`/api/admin/issues/${ISSUE_ID}/escalate`, { action: 'bump_priority' }),
        mockParams
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toMatch(/medium.*high/i);
    });
 
    test('bumps low → medium, high → critical', async () => {
      mockFindOne
        .mockResolvedValueOnce({ ...MOCK_ISSUE, priority: 'low' })
        .mockResolvedValueOnce({ ...MOCK_ISSUE, priority: 'medium' });
 
      const res  = await POST(
        makePost(`/api/admin/issues/${ISSUE_ID}/escalate`, { action: 'bump_priority' }),
        mockParams
      );
      expect(res.status).toBe(200);
      const updateArg = mockUpdateOne.mock.calls[0][1];
      expect(updateArg.$set.priority).toBe('medium');
    });
  });
 
  // ── warn_volunteer action ───────────────────────────────────────────────────
  describe('action: warn_volunteer', () => {
    test('warns volunteer and returns 200', async () => {
      const { notifyVolunteerWarning } = await import('@/lib/helpers/notification.helper');
      mockFindOne
        .mockResolvedValueOnce(MOCK_ISSUE)
        .mockResolvedValueOnce(MOCK_ISSUE);
 
      const res = await POST(
        makePost(`/api/admin/issues/${ISSUE_ID}/escalate`, {
          action: 'warn_volunteer',
          reason: 'Task is overdue',
        }),
        mockParams
      );
      expect(res.status).toBe(200);
      expect(notifyVolunteerWarning).toHaveBeenCalledWith(
        VOL_ID, ISSUE_ID, 'Broken Street Light', expect.any(String), 2
      );
    });
 
    test('returns 400 when issue has no assigned volunteer', async () => {
      mockFindOne.mockResolvedValueOnce({ ...MOCK_ISSUE, assignedToId: null });
 
      const res = await POST(
        makePost(`/api/admin/issues/${ISSUE_ID}/escalate`, { action: 'warn_volunteer' }),
        mockParams
      );
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.message).toMatch(/no assigned volunteer/i);
    });
  });
 
  // ── reassign action ────────────────────────────────────────────────────────
  describe('action: reassign', () => {
    test('reassigns issue back to pool and returns 200', async () => {
      const { notifyIssueReassigned, notifyAllVolunteersNewTask } =
        await import('@/lib/helpers/notification.helper');
 
      mockFindOne
        .mockResolvedValueOnce(MOCK_ISSUE)
        .mockResolvedValueOnce({ ...MOCK_ISSUE, status: 'reported', assignedToId: null });
 
      const res = await POST(
        makePost(`/api/admin/issues/${ISSUE_ID}/escalate`, { action: 'reassign' }),
        mockParams
      );
      expect(res.status).toBe(200);
      expect(notifyIssueReassigned).toHaveBeenCalled();
      expect(notifyAllVolunteersNewTask).toHaveBeenCalled();
    });
 
    test('sets status back to reported and clears assignedTo', async () => {
      mockFindOne
        .mockResolvedValueOnce(MOCK_ISSUE)
        .mockResolvedValueOnce({ ...MOCK_ISSUE, status: 'reported', assignedToId: null });
 
      await POST(
        makePost(`/api/admin/issues/${ISSUE_ID}/escalate`, { action: 'reassign' }),
        mockParams
      );
 
      const updateArg = mockUpdateOne.mock.calls[0][1];
      expect(updateArg.$set.status).toBe('available');
      expect(updateArg.$set.assignedToId).toBeNull();
      expect(updateArg.$set.assignedTo).toBeNull();
    });
  });
 
  test('returns 500 on DB error', async () => {
    mockFindOne.mockRejectedValueOnce(new Error('DB crash'));
    const res = await POST(
      makePost(`/api/admin/issues/${ISSUE_ID}/escalate`, { action: 'close' }),
      mockParams
    );
    expect(res.status).toBe(500);
  });
});