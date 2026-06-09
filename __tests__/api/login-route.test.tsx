import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;
 
// ── DB mock must be at top before any imports ─────────────────────────────────
const mockFindOne   = jest.fn();
const mockUpdateOne = jest.fn();
 
const mockDb = {
  collection: jest.fn().mockReturnValue({
    findOne:   mockFindOne,
    updateOne: mockUpdateOne,
  }),
};
 
jest.mock('@/lib/db', () => ({
  connectToDatabase: jest.fn().mockResolvedValue({ db: mockDb }),
}));
 
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash:    jest.fn(),
}));
 
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
}));
 
// silence console.error from route catch blocks
let consoleSpy: jest.SpyInstance;
beforeEach(() => {
  consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => consoleSpy.mockRestore());
 
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
 
function makeRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/login', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
}
 
describe('POST /api/auth/login', () => {
  let POST: (req: NextRequest) => Promise<Response>;
 
  beforeAll(async () => {
    ({ POST } = await import('@/app/api/auth/login/route'));
  });
 
  beforeEach(() => jest.clearAllMocks());
 
  // ── Missing fields ────────────────────────────────────────────────────────
  test('returns 400 when email is missing', async () => {
    const res  = await POST(makeRequest({ password: 'Test1234!', role: 'citizen' }));
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/missing.*email|email.*required/i);
  });
 
  test('returns 400 when password is missing', async () => {
    const res  = await POST(makeRequest({ email: 'j@test.com', role: 'citizen' }));
    const body = await res.json();
    expect(body.success).toBe(false);
  });
 
  // ── Invalid email format ──────────────────────────────────────────────────
  test('returns error for invalid email format', async () => {
    const res  = await POST(makeRequest({ email: 'notanemail', password: 'Test1234!', role: 'citizen' }));
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/valid email/i);
  });
 
  // ── Citizen login ─────────────────────────────────────────────────────────
  describe('citizen login', () => {
    test('returns ACCOUNT_NOT_FOUND when citizen does not exist', async () => {
      mockFindOne.mockResolvedValueOnce(null); // settings
      mockFindOne.mockResolvedValueOnce(null); // citizen not found
      const res  = await POST(makeRequest({ email: 'nobody@test.com', password: 'Test1234!', role: 'citizen' }));
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.code).toBe('ACCOUNT_NOT_FOUND');
    });
 
    test('returns error when citizen account is deactivated', async () => {
      mockFindOne.mockResolvedValueOnce(null); // settings
      mockFindOne.mockResolvedValueOnce({ _id: 'c1', email: 'j@test.com', password: 'hashed', isActive: false });
      const res  = await POST(makeRequest({ email: 'j@test.com', password: 'Test1234!', role: 'citizen' }));
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toMatch(/deactivated/i);
    });
 
    test('returns INCORRECT_PASSWORD for wrong password', async () => {
      mockFindOne.mockResolvedValueOnce(null); // settings
      mockFindOne.mockResolvedValueOnce({ _id: 'c1', email: 'j@test.com', password: 'hashed', isActive: true, name: 'J' });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      const res  = await POST(makeRequest({ email: 'j@test.com', password: 'wrong', role: 'citizen' }));
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.code).toBe('INCORRECT_PASSWORD');
    });
 
    test('returns token and user on successful citizen login', async () => {
      mockFindOne.mockResolvedValueOnce(null); // settings — no maintenance
      mockFindOne.mockResolvedValueOnce({
        _id: 'citizen-1', email: 'j@test.com', password: 'hashed',
        isActive: true, name: 'Jaspreet', avatar: null, isEmailVerified: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 1 });
 
      const res  = await POST(makeRequest({ email: 'j@test.com', password: 'Test1234!', role: 'citizen' }));
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.token).toBe('mock-jwt-token');
      expect(body.data.user.role).toBe('citizen');
    });
 
    test('updates lastLoginAt on successful citizen login', async () => {
      mockFindOne.mockResolvedValueOnce(null);
      mockFindOne.mockResolvedValueOnce({
        _id: 'c1', email: 'j@test.com', password: 'hashed',
        isActive: true, name: 'J',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 1 });
 
      await POST(makeRequest({ email: 'j@test.com', password: 'Test1234!', role: 'citizen' }));
      expect(mockUpdateOne).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ $set: expect.objectContaining({ lastLoginAt: expect.any(Date) }) })
      );
    });
  });
 
  // ── Volunteer login ───────────────────────────────────────────────────────
  describe('volunteer login', () => {
    test('returns ACCOUNT_PENDING_APPROVAL with status 403', async () => {
      mockFindOne.mockResolvedValueOnce(null); // settings
      mockFindOne.mockResolvedValueOnce({
        _id: 'v1', email: 'vol@test.com', password: 'hashed',
        approvalStatus: 'pending', isActive: true, name: 'Vol',
      });
      const res  = await POST(makeRequest({ email: 'vol@test.com', password: 'Test1234!', role: 'volunteer' }));
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.code).toBe('ACCOUNT_PENDING_APPROVAL');
    });
 
    test('returns ACCOUNT_REJECTED with status 403', async () => {
      mockFindOne.mockResolvedValueOnce(null);
      mockFindOne.mockResolvedValueOnce({
        _id: 'v2', email: 'vol@test.com', password: 'hashed',
        approvalStatus: 'rejected', isActive: true, name: 'Vol',
      });
      const res  = await POST(makeRequest({ email: 'vol@test.com', password: 'Test1234!', role: 'volunteer' }));
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.code).toBe('ACCOUNT_REJECTED');
    });
 
    test('returns token on successful volunteer login', async () => {
      mockFindOne.mockResolvedValueOnce(null);
      mockFindOne.mockResolvedValueOnce({
        _id: 'v3', email: 'vol@test.com', password: 'hashed',
        approvalStatus: 'approved', isActive: true, name: 'Arshdeep',
        skills: ['plumbing'], avatar: null, isEmailVerified: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 1 });
 
      const res  = await POST(makeRequest({ email: 'vol@test.com', password: 'Test1234!', role: 'volunteer' }));
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.user.role).toBe('volunteer');
    });
  });
 
  // ── Admin login ───────────────────────────────────────────────────────────
  describe('admin login', () => {
    test('returns error when security key is missing', async () => {
      const res  = await POST(makeRequest({ email: 'admin@test.com', password: 'Admin1234!', role: 'admin' }));
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toMatch(/security key/i);
    });
 
    test('returns token on successful admin login', async () => {
      mockFindOne.mockResolvedValueOnce({
        _id: 'a1', email: 'admin@test.com', password: 'hashed',
        isActive: true, name: 'Admin', avatar: null, isEmailVerified: true,
        permissions: ['all'], department: 'IT',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 1 });
 
      const res  = await POST(makeRequest({ email: 'admin@test.com', password: 'Admin1234!', role: 'admin', securityKey: 'SECRET' }));
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.user.role).toBe('admin');
    });
  });
 
  // ── Maintenance mode ──────────────────────────────────────────────────────
  test('returns 503 MAINTENANCE_MODE for non-admin during maintenance', async () => {
    mockFindOne.mockResolvedValueOnce({ key: 'global', maintenanceMode: true });
    const res  = await POST(makeRequest({ email: 'j@test.com', password: 'Test1234!', role: 'citizen' }));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.code).toBe('MAINTENANCE_MODE');
  });
 
  // ── Invalid role ──────────────────────────────────────────────────────────
  test('returns error for invalid role', async () => {
    const res  = await POST(makeRequest({ email: 'j@test.com', password: 'Test1234!', role: 'superuser' }));
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/invalid role/i);
  });
 
  // ── Server error ──────────────────────────────────────────────────────────
  test('returns 500 on unexpected DB error', async () => {
    const { connectToDatabase } = await import('@/lib/db');
    (connectToDatabase as jest.Mock).mockRejectedValueOnce(new Error('DB crash'));
    const res = await POST(makeRequest({ email: 'j@test.com', password: 'Test1234!', role: 'citizen' }));
    expect(res.status).toBe(500);
  });
});