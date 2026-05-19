jest.mock('@/lib/auth/getCurrentUser', () => ({
    getCurrentUser: jest.fn(),
}));

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { NextRequest } from 'next/server';
import { makeGetRequest, mockCountDocuments } from '../db/mongodb';

describe('GET /api/notifications/unread/count', () => {
    let GET: (req: NextRequest) => Promise<Response>;
   
    beforeAll(async () => {
      ({ GET } = await import('@/app/api/notifications/unread/count/route'));
    });
   
    beforeEach(() => {
      jest.clearAllMocks();
      (getCurrentUser as jest.Mock).mockReturnValue({ id: 'user123', role: 'citizen' });
    });
   
    test('returns 401 when unauthenticated', async () => {
      (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
      const res = await GET(makeGetRequest('http://localhost:3000/api/notifications/unread/count'));
      expect(res.status).toBe(401);
    });
   
    test('returns count of unread notifications', async () => {
      mockCountDocuments.mockResolvedValueOnce(7);
      const res = await GET(makeGetRequest('http://localhost:3000/api/notifications/unread/count'));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.count).toBe(7);
    });
   
    test('returns 0 when no unread notifications', async () => {
      mockCountDocuments.mockResolvedValueOnce(0);
      const res = await GET(makeGetRequest('http://localhost:3000/api/notifications/unread/count'));
      expect(res.status).toBe(200);
      expect((await res.json()).count).toBe(0);
    });
   
    test('queries for both broadcast and user-specific notifications', async () => {
      mockCountDocuments.mockResolvedValueOnce(3);
      await GET(makeGetRequest('http://localhost:3000/api/notifications/unread/count'));
   
      const filterArg = mockCountDocuments.mock.calls[0][0];
      // The $or should include broadcast and targetUserId checks
      expect(filterArg.$or).toBeDefined();
      expect(filterArg.isRead).toBe(false);
      expect(filterArg.isArchived).toBe(false);
    });
   
    test('returns 500 on DB error', async () => {
      mockCountDocuments.mockRejectedValueOnce(new Error('DB error'));
      const res = await GET(makeGetRequest('http://localhost:3000/api/notifications/unread/count'));
      expect(res.status).toBe(500);
    });
  });