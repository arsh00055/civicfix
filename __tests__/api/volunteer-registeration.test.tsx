import { NextRequest } from 'next/server';
import { mockFindOne, makeRequest, mockInsertOne } from '../db/mongodb';

describe('POST /api/auth/register/volunteer', () => {
    let POST: (req: NextRequest) => Promise<Response>;
  
    beforeAll(async () => {
      ({ POST } = await import('@/app/api/auth/register/volunteer/route'));
    });
  
    beforeEach(() => jest.clearAllMocks());
  
    const VALID_VOLUNTEER = {
      email:          'arshdeep@test.com',
      password:       'Pass1234!',
      firstName:      'Arshdeep',
      lastName:       'Singh',
      phone:          '+91 9876543210',
      skills:         ['plumbing', 'electrical'],
      availability:   ['weekends'],
      experienceLevel:'beginner',
    };
  
    // ── Registration open check ─────────────────────────────────────────────
    test('returns 403 when volunteer registration is disabled', async () => {
      mockFindOne.mockResolvedValueOnce({ key: 'global', allowVolunteerRegistration: false });
  
      const res = await POST(makeRequest(VALID_VOLUNTEER));
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.message).toMatch(/registration is currently closed/i);
    });
  
    // ── Validation ──────────────────────────────────────────────────────────
    test('returns 400 when required fields are missing', async () => {
      mockFindOne.mockResolvedValueOnce(null); // settings — registration open
      const { skills, ...missingSkills } = VALID_VOLUNTEER;
  
      const res = await POST(makeRequest(missingSkills));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.message).toMatch(/missing required fields/i);
    });
  
    test('returns 400 for invalid email', async () => {
      mockFindOne.mockResolvedValueOnce(null);
      const res = await POST(makeRequest({ ...VALID_VOLUNTEER, email: 'notanemail' }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.message).toMatch(/valid email/i);
    });
  
    test('returns 400 when password is too short', async () => {
      mockFindOne.mockResolvedValueOnce(null);
      const res = await POST(makeRequest({ ...VALID_VOLUNTEER, password: 'short' }));
      expect(res.status).toBe(400);
      expect((await res.json()).message).toMatch(/at least 8 characters/i);
    });
  
    test('returns 400 when skills array is empty', async () => {
      mockFindOne.mockResolvedValueOnce(null);
      const res = await POST(makeRequest({ ...VALID_VOLUNTEER, skills: [] }));
      expect(res.status).toBe(400);
      expect((await res.json()).message).toMatch(/at least one skill/i);
    });
  
    test('returns 400 for invalid experience level', async () => {
      mockFindOne.mockResolvedValueOnce(null);
      const res = await POST(makeRequest({ ...VALID_VOLUNTEER, experienceLevel: 'god-mode' }));
      expect(res.status).toBe(400);
      expect((await res.json()).message).toMatch(/invalid experience level/i);
    });
  
    // ── Duplicate email ──────────────────────────────────────────────────────
    test('returns 409 when email already exists as citizen', async () => {
      mockFindOne
        .mockResolvedValueOnce(null)                          // settings — open
        .mockResolvedValueOnce({ email: 'arshdeep@test.com' }) // found in citizens
      ;
      const res = await POST(makeRequest(VALID_VOLUNTEER));
      expect(res.status).toBe(409);
      expect((await res.json()).message).toMatch(/already registered as citizen/i);
    });
  
    test('returns 409 when email already exists as volunteer', async () => {
      mockFindOne
        .mockResolvedValueOnce(null) // settings — open
        .mockResolvedValueOnce(null) // not in citizens
        .mockResolvedValueOnce({ email: 'arshdeep@test.com' }) // found in volunteers
      ;
      const res = await POST(makeRequest(VALID_VOLUNTEER));
      expect(res.status).toBe(409);
      expect((await res.json()).message).toMatch(/already registered/i);
    });
  
    // ── Successful registration ──────────────────────────────────────────────
    test('returns 201 with pending status on success', async () => {
      mockFindOne
        .mockResolvedValueOnce(null) // settings — open
        .mockResolvedValueOnce(null) // not in citizens
        .mockResolvedValueOnce(null) // not in volunteers
      ;
      mockInsertOne.mockResolvedValueOnce({ acknowledged: true, insertedId: 'newId123' });
  
      const res = await POST(makeRequest(VALID_VOLUNTEER));
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.approvalStatus).toBe('pending');
      expect(body.data.role).toBe('volunteer');
    });
  
    test('hashes the password before storing', async () => {
      const bcrypt = await import('bcryptjs');
      mockFindOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
      ;
      mockInsertOne.mockResolvedValueOnce({ acknowledged: true, insertedId: 'newId' });
  
      await POST(makeRequest(VALID_VOLUNTEER));
      expect(bcrypt.hash).toHaveBeenCalledWith('Pass1234!', 10);
    });
  
    test('stores email in lowercase', async () => {
      mockFindOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
      ;
      mockInsertOne.mockResolvedValueOnce({ acknowledged: true, insertedId: 'newId' });
  
      await POST(makeRequest({ ...VALID_VOLUNTEER, email: 'ARSHDEEP@TEST.COM' }));
  
      const storedDoc = mockInsertOne.mock.calls[0][0];
      expect(storedDoc.email).toBe('arshdeep@test.com');
    });
  });