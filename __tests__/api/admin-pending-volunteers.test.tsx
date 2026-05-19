jest.mock('@/lib/auth/getCurrentUser', () => ({
    getCurrentUser: jest.fn(),
}));

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { NextRequest } from 'next/server';
import { makeGetRequest, mockChain, mockDb } from '../db/mongodb';

describe('GET /api/admin/volunteers/pending', () => {
    let GET: (req: NextRequest) => Promise<Response>;
   
    beforeAll(async () => {
      ({ GET } = await import('@/app/api/admin/volunteers/pending/route'));
    });
   
    beforeEach(() => {
      jest.clearAllMocks();
      (getCurrentUser as jest.Mock).mockReturnValue({ id: 'admin1', role: 'admin' });
    });
   
    test('returns 401 when unauthenticated', async () => {
      (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
      const res = await GET(makeGetRequest('http://localhost:3000/api/admin/volunteers/pending'));
      expect(res.status).toBe(401);
    });
   
    test('returns 401 for non-admin users', async () => {
      (getCurrentUser as jest.Mock).mockReturnValueOnce({ id: 'v1', role: 'volunteer' });
      const res = await GET(makeGetRequest('http://localhost:3000/api/admin/volunteers/pending'));
      expect(res.status).toBe(401);
    });
   
    test('returns list of pending volunteers', async () => {
      mockChain.toArray.mockResolvedValueOnce([
        {
          _id: 'vol1',
          name: 'Pending Vol',
          email: 'vol@test.com',
          skills: ['plumbing'],
          experienceLevel: 'beginner',
          createdAt: new Date(),
        },
      ]);
   
      const res = await GET(makeGetRequest('http://localhost:3000/api/admin/volunteers/pending'));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe('Pending Vol');
      expect(body.count).toBe(1);
    });
   
    test('returns empty array when no pending volunteers', async () => {
      mockChain.toArray.mockResolvedValueOnce([]);
      const res = await GET(makeGetRequest('http://localhost:3000/api/admin/volunteers/pending'));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(0);
      expect(body.count).toBe(0);
    });
   
    test('queries only approvalStatus: pending', async () => {
      mockChain.toArray.mockResolvedValueOnce([]);
      await GET(makeGetRequest('http://localhost:3000/api/admin/volunteers/pending'));
      // find() should have been called with { approvalStatus: 'pending' }
      const findCall = mockDb.collection('volunteers').find;
      expect(findCall).toHaveBeenCalledWith({ approvalStatus: 'pending' });
    });
   
    test('never exposes passwords in response', async () => {
      mockChain.toArray.mockResolvedValueOnce([
        { _id: 'v1', name: 'V', email: 'v@test.com', password: 'hashed', skills: [] }
      ]);
      const res = await GET(makeGetRequest('http://localhost:3000/api/admin/volunteers/pending'));
      const body = await res.json();
      body.data.forEach((v: any) => expect(v.password).toBeUndefined());
    });
   
    test('returns 500 on DB error', async () => {
      mockChain.toArray.mockRejectedValueOnce(new Error('DB error'));
      const res = await GET(makeGetRequest('http://localhost:3000/api/admin/volunteers/pending'));
      expect(res.status).toBe(500);
    });
  });