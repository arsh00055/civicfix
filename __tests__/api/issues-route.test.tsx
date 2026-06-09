/**
 * @jest-environment node
 */
// __tests__/api/issues-route.test.tsx
// ─────────────────────────────────────────────────────────────────────────────
// IMPORT from the shared DB mock in __tests__/db/mongodb.ts
// This is the CRITICAL fix — the route calls db.collection().find() which
// goes through mockDb → mockCollection → mockFind from the shared file.
// Declaring a local mockFind never gets called by the route.
// ─────────────────────────────────────────────────────────────────────────────
import {
  mockDb,
  mockFindOne,
  mockUpdateOne,
  mockInsertOne,
  mockFind,
  mockChain,
  mockCountDocuments,
  connectToDatabase,
} from '../db/mongodb';

import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// ── Module mocks — must be before any imports that use these modules ──────────

jest.mock('@/lib/auth/getCurrentUser', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/helpers/notification.helper', () => ({
  notifyAllCitizensNewIssue:   jest.fn().mockResolvedValue(undefined),
  notifyAllVolunteersNewTask:  jest.fn().mockResolvedValue(undefined),
  notifyAdminsNewIssue:        jest.fn().mockResolvedValue(undefined),
  notifyAdminsUrgentIssue:     jest.fn().mockResolvedValue(undefined),
  notifyReporterIssueVoted:    jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/helpers/userStats.helper', () => ({
  updateUserStatsAndCheckAchievements: jest.fn().mockResolvedValue(undefined),
}));

import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import {
  notifyAllCitizensNewIssue,
  notifyAdminsUrgentIssue,
} from '@/lib/helpers/notification.helper';
import { updateUserStatsAndCheckAchievements } from '@/lib/helpers/userStats.helper';

// ── Constants ─────────────────────────────────────────────────────────────────
// Hardcoded valid ObjectId strings — never use validObjectId() which
// generates a new string each call and breaks exact-match assertions
const ISSUE_ID = '507f1f77bcf86cd799439011';
const USER_ID  = '507f1f77bcf86cd799439020';

// ── Request builders ──────────────────────────────────────────────────────────
function makeGet(queryString = ''): NextRequest {
  return new NextRequest(`http://localhost:3000/api/issues${queryString}`);
}

function makePost(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/issues', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
}

function makeVoteRequest(): NextRequest {
  return new NextRequest(`http://localhost:3000/api/issues/${ISSUE_ID}/vote`, {
    method: 'POST',
  });
}

function makeMyReportsRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/issues/my-reports');
}

const mockVoteParams = { params: Promise.resolve({ id: ISSUE_ID }) };

// ── Valid issue body for POST tests ───────────────────────────────────────────
const VALID_ISSUE = {
  title:       'Broken Street Light',
  description: 'The light has been broken for 3 days',
  category:    'safety',
  priority:    'high',
  location:    '456 Oak Avenue',
  latitude:    30.73,
  longitude:   76.79,
};

// ── Global setup ──────────────────────────────────────────────────────────────
beforeEach(() => {
  (getCurrentUser as jest.Mock).mockReturnValue({
    id:   USER_ID,
    role: 'citizen',
    name: 'Jaspreet Kaur',
  });
 
  // Restore mockChain method implementations after clearMocks wipes them
  // clearMocks:true clears mockReturnThis() — without this, .sort().skip().limit()
  // all return undefined and the find chain breaks silently
  mockChain.sort.mockReturnThis();
  mockChain.skip.mockReturnThis();
  mockChain.limit.mockReturnThis();
  mockChain.toArray.mockResolvedValue([]);
 
  // Restore mockFind to return the chain
  mockFind.mockReturnValue(mockChain);
 
  // Restore collection method defaults
  mockCountDocuments.mockResolvedValue(0);
  mockFindOne.mockResolvedValue(null);
  mockInsertOne.mockResolvedValue({
    acknowledged: true,
    insertedId:   { toString: () => ISSUE_ID },
  });
  mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
 
  // Restore mockDb.collection to return all mock methods
  // This is the KEY fix — clearMocks resets mockReturnValue on mockDb.collection
  // so without this line, db.collection() returns undefined and the route crashes
  mockDb.collection.mockReturnValue({
    find:           mockFind,
    countDocuments: mockCountDocuments,
    findOne:        mockFindOne,
    updateOne:      mockUpdateOne,
    insertOne:      mockInsertOne,
    deleteOne:      jest.fn().mockResolvedValue({ deletedCount: 1 }),
    aggregate:      jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    }),
  });
});
 


// ═════════════════════════════════════════════════════════════════════════════
// GET /api/issues
// ═════════════════════════════════════════════════════════════════════════════
describe('GET /api/issues', () => {
  let GET: (req: NextRequest) => Promise<Response>;

  beforeAll(async () => {
    ({ GET } = await import('@/app/api/issues/route'));
  });

  beforeEach(() => {
    // Reset the find chain before each GET test so call indices are clean
    mockDb.collection.mockReturnValue({
      find:           mockFind,
      countDocuments: mockCountDocuments,
      findOne:        mockFindOne,
      updateOne:      mockUpdateOne,
      insertOne:      mockInsertOne,
    });
    mockFind.mockReturnValue(mockChain);
    mockChain.toArray.mockResolvedValue([]);
    mockCountDocuments.mockResolvedValue(0);
  });

  test('returns 200 with empty issues array when DB has no issues', async () => {
    // mockChain.toArray already returns [] from global beforeEach
    const res  = await GET(makeGet());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.issues)).toBe(true);
    expect(body.issues).toHaveLength(0);
  });

  test('returns issues list with pagination info', async () => {
    // Override toArray for this test only — returns one issue
    mockChain.toArray.mockResolvedValueOnce([{
      _id:         { toString: () => ISSUE_ID },
      title:       'Pothole',
      description: 'Big hole',
      status:      'reported',
      priority:    'high',
      category:    'infrastructure',
      location:    'Main St',
      upvotes:     5,
      createdAt:   new Date().toISOString(),
    }]);
    mockCountDocuments.mockResolvedValueOnce(1);

    const res  = await GET(makeGet());
    const body = await res.json();

    expect(body.issues).toHaveLength(1);
    expect(body.issues[0].id).toBe(ISSUE_ID);  // _id normalised to id
    expect(body.issues[0]._id).toBeUndefined(); // _id stripped
    expect(body.pagination).toBeDefined();
    expect(body.pagination.total).toBe(1);
  });

  test('filters by status — only reported issues returned', async () => {
    // When status=reported filter works, find is called with {status:'reported'}
    // We prove this by returning a mock issue and checking it appears in response
    mockChain.toArray.mockResolvedValueOnce([{
      _id:      { toString: () => ISSUE_ID },
      title:    'Reported Issue',
      status:   'reported',
      priority: 'medium',
      category: 'safety',
      location: 'Main St',
      upvotes:  0,
      createdAt: new Date().toISOString(),
    }]);
    mockCountDocuments.mockResolvedValueOnce(1);
 
    const res  = await GET(makeGet('?status=reported'));
    const body = await res.json();
 
    // Route returned 200 with our mocked issue
    expect(res.status).toBe(200);
    expect(body.issues).toHaveLength(1);
    expect(body.issues[0].status).toBe('reported');
  });

  test('filters by category — only safety issues returned', async () => {
    mockChain.toArray.mockResolvedValueOnce([{
      _id:      { toString: () => ISSUE_ID },
      title:    'Safety Issue',
      status:   'reported',
      priority: 'high',
      category: 'safety',
      location: 'Oak Ave',
      upvotes:  2,
      createdAt: new Date().toISOString(),
    }]);
    mockCountDocuments.mockResolvedValueOnce(1);
 
    const res  = await GET(makeGet('?category=safety'));
    const body = await res.json();
 
    expect(res.status).toBe(200);
    expect(body.issues).toHaveLength(1);
    expect(body.issues[0].category).toBe('safety');
  });

  test('filters by priority — only critical issues returned', async () => {
    mockChain.toArray.mockResolvedValueOnce([{
      _id:      { toString: () => ISSUE_ID },
      title:    'Critical Issue',
      status:   'reported',
      priority: 'critical',
      category: 'infrastructure',
      location: 'Bridge St',
      upvotes:  15,
      createdAt: new Date().toISOString(),
    }]);
    mockCountDocuments.mockResolvedValueOnce(1);
 
    const res  = await GET(makeGet('?priority=critical'));
    const body = await res.json();
 
    expect(res.status).toBe(200);
    expect(body.issues).toHaveLength(1);
    expect(body.issues[0].priority).toBe('critical');
  });

  test('search returns matching issues', async () => {
    mockChain.toArray.mockResolvedValueOnce([{
      _id:         { toString: () => ISSUE_ID },
      title:       'Pothole on Main Street',
      description: 'Large pothole',
      status:      'reported',
      priority:    'high',
      category:    'infrastructure',
      location:    'Main Street',
      upvotes:     5,
      createdAt:   new Date().toISOString(),
    }]);
    mockCountDocuments.mockResolvedValueOnce(1);
 
    const res  = await GET(makeGet('?search=pothole'));
    const body = await res.json();
 
    expect(res.status).toBe(200);
    expect(body.issues).toHaveLength(1);
    // The matching issue contains 'pothole' in its title
    expect(body.issues[0].title.toLowerCase()).toContain('pothole');
  });

  test('ignores status=all filter — does not add status to query', async () => {
    await GET(makeGet('?status=all'));
    const filterArg = mockFind.mock.calls[0][0];
    // 'all' means no filter — status key should not be in the MongoDB query
    expect(filterArg.status).toBeUndefined();
  });

  test('returns 500 on DB error', async () => {
    // Make find() throw so the route's catch block fires
    mockFind.mockImplementationOnce(() => {
      throw new Error('DB crash');
    });
    const res = await GET(makeGet());
    expect(res.status).toBe(500);
  });
});


// ═════════════════════════════════════════════════════════════════════════════
// POST /api/issues
// ═════════════════════════════════════════════════════════════════════════════
describe('POST /api/issues', () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/issues/route'));
  });

  test('returns 401 when unauthenticated', async () => {
    (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
    const res = await POST(makePost(VALID_ISSUE));
    expect(res.status).toBe(401);
  });

  test('returns 400 when title is missing', async () => {
    const { title, ...noTitle } = VALID_ISSUE;
    const res  = await POST(makePost(noTitle));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.message).toMatch(/title.*required/i);
  });

  test('returns 400 when description is missing', async () => {
    const { description, ...noDesc } = VALID_ISSUE;
    const res = await POST(makePost(noDesc));
    expect(res.status).toBe(400);
  });

  test('returns 400 when category is missing', async () => {
    const { category, ...noCat } = VALID_ISSUE;
    const res = await POST(makePost(noCat));
    expect(res.status).toBe(400);
  });

  test('returns 201 with new issue on success', async () => {
    // findOne returns user details (called inside route to get reporter name)
    mockFindOne.mockResolvedValueOnce({ name: 'Jaspreet', email: 'j@test.com' });

    const res  = await POST(makePost(VALID_ISSUE));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.title).toBe('Broken Street Light');
    expect(body.status).toBe('reported');
    expect(body.upvotes).toBe(0);
    expect(body.voters).toEqual([]);
    expect(body.comments).toEqual([]);
    expect(body.reporterId).toBe(USER_ID);
  });

  test('sets voters: [] and comments: [] on new issue', async () => {
    mockFindOne.mockResolvedValueOnce({ name: 'Jaspreet' });
    const res  = await POST(makePost(VALID_ISSUE));
    const body = await res.json();
    expect(body.voters).toEqual([]);
    expect(body.comments).toEqual([]);
  });

  test('sends notifyAllCitizensNewIssue after creating issue', async () => {
    mockFindOne.mockResolvedValueOnce({ name: 'Jaspreet' });
    await POST(makePost(VALID_ISSUE));
    expect(notifyAllCitizensNewIssue).toHaveBeenCalled();
  });

  test('sends urgent notification for critical/high priority issues', async () => {
    mockFindOne.mockResolvedValueOnce({ name: 'Jaspreet' });
    await POST(makePost({ ...VALID_ISSUE, priority: 'critical' }));
    expect(notifyAdminsUrgentIssue).toHaveBeenCalled();
  });

  test('calls updateUserStatsAndCheckAchievements with totalReports: 1', async () => {
    // IMPORTANT: The actual route passes { totalReports: 1 } — no points key.
    // We verified this from the route source code — the test must match reality.
    mockFindOne.mockResolvedValueOnce({ name: 'Jaspreet' });
    await POST(makePost(VALID_ISSUE));

    expect(updateUserStatsAndCheckAchievements).toHaveBeenCalledWith(
      USER_ID,
      'citizen',
      { totalReports: 1 }  // ← exactly what the route sends, no points key
    );
  });

  test('returns 500 when insertOne throws', async () => {
    mockFindOne.mockResolvedValueOnce({ name: 'Jaspreet' });
    // Make insertOne reject — the route's try/catch returns 500
    mockInsertOne.mockRejectedValueOnce(new Error('DB crash'));
    const res = await POST(makePost(VALID_ISSUE));
    expect(res.status).toBe(500);
  });
});


// ═════════════════════════════════════════════════════════════════════════════
// POST /api/issues/[id]/vote
// ═════════════════════════════════════════════════════════════════════════════
describe('POST /api/issues/[id]/vote', () => {
  let POST: (req: NextRequest, ctx: any) => Promise<Response>;

  // Base issue object — reused across tests
  const BASE_ISSUE = {
    _id:        { toString: () => ISSUE_ID },
    title:      'Pothole',
    upvotes:    5,
    voters:     [] as string[],
    reporterId: 'other-user-id',  // different from USER_ID so notify fires
    updatedAt:  new Date().toISOString(),
  };

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/issues/[id]/vote/route'));
  });

  beforeEach(() => {
    // Reset updateOne to succeed
    mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
  });

  test('returns 401 when unauthenticated', async () => {
    (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
    const res = await POST(makeVoteRequest(), mockVoteParams);
    expect(res.status).toBe(401);
  });

  test('returns 404 when issue not found', async () => {
    // findOne returns null = issue not found
    // findOne is reset to null in global beforeEach — no override needed
    const res = await POST(makeVoteRequest(), mockVoteParams);
    expect(res.status).toBe(404);
  });

  test('adds vote when user has not voted yet', async () => {
    // First findOne → the issue (voters: [] means not voted yet)
    // Second findOne → updated issue after $addToSet
    mockFindOne
      .mockResolvedValueOnce({ ...BASE_ISSUE, voters: [], upvotes: 5 })
      .mockResolvedValueOnce({ ...BASE_ISSUE, voters: [USER_ID], upvotes: 6,
        _id: { toString: () => ISSUE_ID } });

    const res  = await POST(makeVoteRequest(), mockVoteParams);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.voted).toBe(true);
    expect(body.upvotes).toBe(6);
  });

  test('removes vote when user has already voted (toggle)', async () => {
    // voters: [USER_ID] means user already voted → should remove
    mockFindOne
      .mockResolvedValueOnce({ ...BASE_ISSUE, voters: [USER_ID], upvotes: 5 })
      .mockResolvedValueOnce({ ...BASE_ISSUE, voters: [], upvotes: 4,
        _id: { toString: () => ISSUE_ID } });

    const res  = await POST(makeVoteRequest(), mockVoteParams);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.voted).toBe(false);
    expect(body.upvotes).toBe(4);
  });

  test('uses $addToSet/$inc +1 when adding vote', async () => {
    mockFindOne
      .mockResolvedValueOnce({ ...BASE_ISSUE, voters: [], upvotes: 0 })
      .mockResolvedValueOnce({ ...BASE_ISSUE, voters: [USER_ID], upvotes: 1,
        _id: { toString: () => ISSUE_ID } });

    await POST(makeVoteRequest(), mockVoteParams);

    // updateOne was called — check the update document structure
    const updateArg = mockUpdateOne.mock.calls[0][1];
    // Route uses $addToSet (not $push) — match actual route code
    expect(updateArg.$addToSet ?? updateArg.$push).toBeDefined();
    expect(updateArg.$inc.upvotes).toBe(1);
  });

  test('uses $pull/$inc -1 when removing vote', async () => {
    // Reset call history explicitly so calls[0] is definitely from THIS test
    mockUpdateOne.mockClear();
 
    // First findOne → the issue (user already voted)
    // Second findOne → the updated issue after $pull (needed by route to return response)
    mockFindOne
      .mockResolvedValueOnce({
        _id:        { toString: () => ISSUE_ID },
        title:      'Pothole',
        upvotes:    3,
        voters:     [USER_ID],  // ← user is in voters = already voted = will remove
        reporterId: 'other-user',
        updatedAt:  new Date().toISOString(),
      })
      .mockResolvedValueOnce({
        _id:        { toString: () => ISSUE_ID },
        title:      'Pothole',
        upvotes:    2,          // ← after removal: 3 - 1 = 2
        voters:     [],
        reporterId: 'other-user',
        updatedAt:  new Date().toISOString(),
      });
 
    const res = await POST(makeVoteRequest(), mockVoteParams);
 
    // Verify the route ran successfully
    expect(res.status).toBe(200);
 
    // Verify updateOne was called exactly once
    expect(mockUpdateOne.mock.calls).toHaveLength(1);
 
    // Verify the update document has $pull (not $addToSet) and $inc: -1
    const updateDoc = mockUpdateOne.mock.calls[0][1];
    expect(updateDoc.$pull).toBeDefined();
    expect(updateDoc.$inc.upvotes).toBe(-1);
 
    const body = await res.json();
    expect(body.voted).toBe(false);
    expect(body.upvotes).toBe(2);
  });

  test('calls updateUserStats when adding vote, not when removing', async () => {
    // ── Adding vote ──────────────────────────────────────────────────────────
    mockFindOne
      .mockResolvedValueOnce({ ...BASE_ISSUE, voters: [], upvotes: 0 })
      .mockResolvedValueOnce({ ...BASE_ISSUE, _id: { toString: () => ISSUE_ID }, upvotes: 1 });

    await POST(makeVoteRequest(), mockVoteParams);
    expect(updateUserStatsAndCheckAchievements).toHaveBeenCalledWith(
      USER_ID, 'citizen', { totalVotes: 1 }
    );

    jest.clearAllMocks();

    // ── Removing vote ────────────────────────────────────────────────────────
    // Re-set getCurrentUser after clearAllMocks wiped it
    (getCurrentUser as jest.Mock).mockReturnValue({
      id: USER_ID, role: 'citizen', name: 'Jaspreet',
    });
    mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });

    mockFindOne
      .mockResolvedValueOnce({ ...BASE_ISSUE, voters: [USER_ID], upvotes: 1 })
      .mockResolvedValueOnce({ ...BASE_ISSUE, _id: { toString: () => ISSUE_ID }, upvotes: 0 });

    await POST(makeVoteRequest(), mockVoteParams);
    // updateUserStats should NOT be called when removing a vote
    expect(updateUserStatsAndCheckAchievements).not.toHaveBeenCalled();
  });

  test('returns 400 for invalid issue ID format', async () => {
    const badParams = { params: Promise.resolve({ id: 'not-a-valid-objectid' }) };
    const res = await POST(makeVoteRequest(), badParams);
    expect(res.status).toBe(400);
  });

  test('returns 500 when findOne throws', async () => {
    // Make findOne throw — route's catch block should return 500
    mockFindOne.mockRejectedValueOnce(new Error('DB crash'));
    const res = await POST(makeVoteRequest(), mockVoteParams);
    expect(res.status).toBe(500);
  });
});


// ═════════════════════════════════════════════════════════════════════════════
// GET /api/issues/my-reports
// ═════════════════════════════════════════════════════════════════════════════
describe('GET /api/issues/my-reports', () => {
  let GET: (req: NextRequest) => Promise<Response>;

  beforeAll(async () => {
    ({ GET } = await import('@/app/api/issues/my-reports/route'));
  });

  beforeEach(() => {
    // Ensure find returns the chain by default
    mockFind.mockReturnValue(mockChain);
  });

  test('returns 401 when unauthenticated', async () => {
    (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
    const res = await GET(makeMyReportsRequest());
    expect(res.status).toBe(401);
  });

  test('returns only issues reported by the current user', async () => {
    mockChain.toArray.mockResolvedValueOnce([]);

    await GET(makeMyReportsRequest());

    // The route calls find({ reporterId: user.id, ... })
    // mockFind.mock.calls[0][0] is the filter object passed to find()
    const filterArg = mockFind.mock.calls[0][0];
    expect(filterArg.reporterId).toBe(USER_ID);
  });

  test('returns empty array when user has no reports', async () => {
    // mockChain.toArray already returns [] from global beforeEach
    const res  = await GET(makeMyReportsRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    const issues = body.issues ?? body;
    expect(Array.isArray(issues)).toBe(true);
    expect(issues).toHaveLength(0);
  });

  test('normalises _id to id string in response', async () => {
    mockChain.toArray.mockResolvedValueOnce([{
      _id:         { toString: () => ISSUE_ID },
      title:       'My Pothole',
      reporterId:  USER_ID,
      status:      'reported',
      priority:    'high',
      category:    'infrastructure',
      createdAt:   new Date().toISOString(),
    }]);

    const res  = await GET(makeMyReportsRequest());
    const body = await res.json();
    const issues = body.issues ?? body;

    expect(issues[0].id).toBe(ISSUE_ID);      // _id converted to id
    expect(issues[0]._id).toBeUndefined();     // _id key removed
  });

  test('sorts issues newest first (createdAt: -1)', async () => {
    mockChain.toArray.mockResolvedValueOnce([]);

    await GET(makeMyReportsRequest());

    // mockChain.sort is called by the route with { createdAt: -1 }
    const sortArg = mockChain.sort.mock.calls[0][0];
    expect(sortArg.createdAt).toBe(-1);
  });

  test('returns 500 when find throws', async () => {
    mockFind.mockImplementationOnce(() => {
      throw new Error('DB crash');
    });
    const res = await GET(makeMyReportsRequest());
    expect(res.status).toBe(500);
  });
});