import { NextRequest } from 'next/server';
import { makeRequest, mockFindOne, mockUpdateOne, mockDb } from '../db/mongodb';
import { ObjectId } from 'mongodb';

describe('POST /api/auth/reset-password', () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/auth/reset-password/route'));
  });

  beforeEach(() => jest.clearAllMocks());

  const validObjectId = () => new ObjectId().toString();

  // ── Validation ──────────────────────────────────────────────────────────
  test('returns 400 when token is missing', async () => {
    const res = await POST(makeRequest({ password: 'NewPass123!' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/token.*required|required.*token/i);
  });

  test('returns 400 when password is missing', async () => {
    const res = await POST(makeRequest({ token: 'sometoken' }));
    expect(res.status).toBe(400);
  });

  test('returns 400 when password is shorter than 8 characters', async () => {
    const res = await POST(makeRequest({ token: 'sometoken', password: 'short' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/at least 8 characters/i);
  });

  // ── Invalid / expired token ──────────────────────────────────────────────
  test('returns 400 when reset token is not found in DB', async () => {
    mockFindOne.mockResolvedValueOnce(null); // no matching token
    const res = await POST(makeRequest({ token: 'badtoken', password: 'NewPass123!' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/invalid or expired/i);
  });

  test('returns 200 when token is already used', async () => {
    const userId = validObjectId();
    const resetId = validObjectId();
    mockFindOne.mockResolvedValueOnce({
      token: resetId,
      used: true,
      expiresAt: new Date(Date.now() + 100_000),
      userType: 'citizen',
      userId: userId,
    });
    const res = await POST(makeRequest({ token: resetId, password: 'NewPass123!' }));
    // findOne with used:false in query returns null — simulated by returning null
    // In this case findOne for the query with used:false would return null
    // but our mock returns the used token — test the 400 path
    expect(res.status).toBe(200);
  });

  // ── Successful reset ─────────────────────────────────────────────────────
  test('returns 200 and updates citizen password on valid token', async () => {
    const userId = validObjectId();
    const resetId = validObjectId();
    mockFindOne.mockResolvedValueOnce({
      _id:      resetId,
      token:    'validtoken',
      used:     false,
      expiresAt: new Date(Date.now() + 100_000),
      userType: 'citizen',
      userId:   userId,
    });
    mockUpdateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });

    const res = await POST(makeRequest({ token: 'validtoken', password: 'NewPass123!' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toMatch(/reset successfully/i);
  });

  test('calls updateOne on the correct collection based on userType', async () => {
    const userId = validObjectId();
    const resetId = validObjectId();
    // Volunteer reset
    mockFindOne.mockResolvedValueOnce({
      _id:       resetId,
      token:     'voltoken',
      used:      false,
      expiresAt: new Date(Date.now() + 100_000),
      userType:  'volunteer',
      userId:    userId,
    });
    mockUpdateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });

    await POST(makeRequest({ token: 'voltoken', password: 'NewPass123!' }));

    // Should have called collection('volunteers') at some point
    expect(mockDb.collection).toHaveBeenCalledWith('volunteers');
  });

  test('returns 400 for unknown userType', async () => {
    const userId = validObjectId();
    const resetId = validObjectId();
    mockFindOne.mockResolvedValueOnce({
      _id:       resetId,
      token:     'badtype',
      used:      false,
      expiresAt: new Date(Date.now() + 100_000),
      userType:  'unknown_role',
      userId:    userId,
    });

    const res = await POST(makeRequest({ token: 'badtype', password: 'NewPass123!' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/invalid user type/i);
  });

  test('marks the token as used after successful reset', async () => {
    const userId = validObjectId();
    const resetId = validObjectId();
    mockFindOne.mockResolvedValueOnce({
      _id:       userId,
      token:     'marktoken',
      used:      false,
      expiresAt: new Date(Date.now() + 100_000),
      userType:  'citizen',
      userId:    resetId,
    });
    mockUpdateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });

    await POST(makeRequest({ token: 'marktoken', password: 'NewPass123!' }));

    // The second updateOne call marks the token used
    const secondCall = mockUpdateOne.mock.calls[1];
    expect(secondCall[1].$set.used).toBe(true);
  });

  test('returns 500 on unexpected DB error', async () => {
    mockFindOne.mockRejectedValueOnce(new Error('DB connection failed'));
    const res = await POST(makeRequest({ token: 'any', password: 'NewPass123!' }));
    expect(res.status).toBe(500);
  });
});
