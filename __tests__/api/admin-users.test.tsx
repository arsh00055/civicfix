jest.mock('@/lib/auth/getCurrentUser', () => ({
    getCurrentUser: jest.fn(),
}));

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { NextRequest } from 'next/server';
import { makeGetRequest, mockChain } from '../db/mongodb';

describe('GET /api/admin/users', () => {
    let GET: (req: NextRequest) => Promise<Response>;
   
    beforeAll(async () => {
      ({ GET } = await import('@/app/api/admin/users/route'));
    });
   
    beforeEach(() => {
      jest.clearAllMocks();
      (getCurrentUser as jest.Mock).mockReturnValue({ id: 'admin1', role: 'admin' });
    });
   
    test('returns 401 when unauthenticated', async () => {
      (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
      const res = await GET(makeGetRequest('http://localhost:3000/api/admin/users'));
      expect(res.status).toBe(401);
    });
   
    test('returns 401 when user is not admin', async () => {
      (getCurrentUser as jest.Mock).mockReturnValueOnce({ id: 'u1', role: 'citizen' });
      const res = await GET(makeGetRequest('http://localhost:3000/api/admin/users'));
      expect(res.status).toBe(401);
    });
   
    test('returns merged list of citizens, volunteers and admins', async () => {
      // Each collection.find().project().toArray() needs to resolve
      mockChain.toArray
        .mockResolvedValueOnce([
          { _id: 'c1', name: 'Citizen One', email: 'c1@test.com', isActive: true, createdAt: new Date() }
        ])
        .mockResolvedValueOnce([
          { _id: 'v1', name: 'Vol One', email: 'v1@test.com', isActive: true, createdAt: new Date(), skills: ['plumbing'] }
        ])
        .mockResolvedValueOnce([
          { _id: 'a1', name: 'Admin One', email: 'a1@test.com', isActive: true, createdAt: new Date() }
        ]);
   
      const res = await GET(makeGetRequest('http://localhost:3000/api/admin/users'));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(3);
      // Check roles are correctly assigned
      expect(body.find((u: any) => u.email === 'c1@test.com').role).toBe('citizen');
      expect(body.find((u: any) => u.email === 'v1@test.com').role).toBe('volunteer');
      expect(body.find((u: any) => u.email === 'a1@test.com').role).toBe('admin');
    });
   
    test('never exposes passwords in response', async () => {
      mockChain.toArray
        .mockResolvedValueOnce([{ _id: 'c1', name: 'C', email: 'c@test.com', password: 'hashed!' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
   
      const res = await GET(makeGetRequest('http://localhost:3000/api/admin/users'));
      const body = await res.json();
      body.forEach((u: any) => expect(u.password).toBeUndefined());
    });
   
    test('returns 500 on DB error', async () => {
      mockChain.toArray.mockRejectedValueOnce(new Error('DB down'));
      const res = await GET(makeGetRequest('http://localhost:3000/api/admin/users'));
      expect(res.status).toBe(500);
    });
  });