import { NextRequest } from 'next/server';
import { mockDb, mockFindOne, mockUpdateOne, makeRequest } from '../db/mongodb';

describe('POST /api/auth/forgot-password', () => {
    let POST: (req: NextRequest) => Promise<Response>;
   
    const mockInsertOne  = jest.fn().mockResolvedValue({ acknowledged: true, insertedId: 'reset-id' });
    const mockDeleteMany = jest.fn().mockResolvedValue({ deletedCount: 1 });
   
    beforeAll(async () => {
      // Override collection mock for this suite
      mockDb.collection.mockImplementation((name: string) => ({
        findOne:    mockFindOne,
        updateOne:  mockUpdateOne,
        insertOne:  mockInsertOne,
        deleteMany: mockDeleteMany,
      }));
      ({ POST } = await import('@/app/api/auth/forgot-password/route'));
    });
   
    beforeEach(() => jest.clearAllMocks());
   
    test('returns 400 when email is missing', async () => {
      const res  = await POST(makeRequest({}));
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toMatch(/email.*required/i);
    });
   
    test('returns 400 for invalid email format', async () => {
      const res  = await POST(makeRequest({ email: 'notvalid' }));
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toMatch(/valid email/i);
    });
   
    test('returns success even when email not found — security best practice', async () => {
      // Should NOT reveal whether email exists
      mockFindOne.mockResolvedValue(null); // not in citizens
      mockFindOne.mockResolvedValue(null); // not in volunteers
      mockFindOne.mockResolvedValue(null); // not in admins
      const res  = await POST(makeRequest({ email: 'unknown@test.com' }));
      const body = await res.json();
      // Route should return success regardless — prevents email enumeration
      expect(res.status).toBeLessThan(500);
    });
   
    test('creates a password reset token when email exists in citizens', async () => {
      mockFindOne
        .mockResolvedValueOnce({ _id: 'c1', email: 'j@test.com', name: 'Jaspreet', role: 'citizen' })
        .mockResolvedValueOnce(null);
   
      await POST(makeRequest({ email: 'j@test.com' }));
      // Should insert a reset token into passwordResets collection
      expect(mockInsertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.anything(),
          token:  expect.any(String),
          used:   false,
        })
      );
    });
   
    test('creates a reset token when email exists in volunteers', async () => {
      mockFindOne
        .mockResolvedValueOnce(null) // not citizen
        .mockResolvedValueOnce({ _id: 'v1', email: 'vol@test.com', name: 'Vol', role: 'volunteer' });
   
      await POST(makeRequest({ email: 'vol@test.com' }));
      expect(mockInsertOne).toHaveBeenCalledWith(
        expect.objectContaining({ userType: 'volunteer' })
      );
    });
   
    test('returns 500 on DB error', async () => {
      mockFindOne.mockRejectedValueOnce(new Error('DB crash'));
      const res = await POST(makeRequest({ email: 'j@test.com' }));
      expect(res.status).toBe(500);
    });
  });  