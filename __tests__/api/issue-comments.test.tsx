jest.mock('@/lib/auth/getCurrentUser', () => ({
  getCurrentUser: jest.fn(),   // ← named export mock
}));

jest.mock('@/lib/helpers/notification.helper', () => ({
  notifyReporterNewComment:    jest.fn().mockResolvedValue(undefined),
  notifyAdminIssueClaimed:     jest.fn().mockResolvedValue(undefined),
  notifyVolunteerTaskClaimed:  jest.fn().mockResolvedValue(undefined),
  notifyIssueClaimed:          jest.fn().mockResolvedValue(undefined),
  // add any other notification functions your comments route uses
}));

jest.mock('@/lib/db', () => ({
  connectToDatabase: jest.fn(),
}));

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { mockFindOne, makeRequest, mockUpdateOne, validObjectId } from '../db/mongodb';
import { NextRequest } from 'next/server';
import { notifyReporterNewComment } from '@/lib/helpers/notification.helper';

describe('Comments API /api/issues/[id]/comments', () => {
    let GET:    (req: NextRequest, ctx: any) => Promise<Response>;
    let POST:   (req: NextRequest, ctx: any) => Promise<Response>;
    let DELETE: (req: NextRequest, ctx: any) => Promise<Response>;
    let PUT:    (req: NextRequest, ctx: any) => Promise<Response>;
  
    const ISSUE_ID   = '507f1f77bcf86cd799439011';
    const USER_ID    = '507f1f77bcf86cd799439020';
    const COMMENT_ID = '507f1f77bcf86cd799439030';
  
    const mockParams = { params: Promise.resolve({ id: ISSUE_ID }) };
  
    const MOCK_COMMENT = {
      id:        COMMENT_ID,
      userId:    USER_ID,
      user:      { id: USER_ID, name: 'Jaspreet', role: 'citizen', avatar: null },
      text:      'Great issue report!',
      upvotes:   0,
      isEdited:  false,
      isPinned:  false,
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z',
    };
  
    beforeAll(async () => {
      const mod = await import('@/app/api/issues/[id]/comments/route');
      GET    = mod.GET;
      POST   = mod.POST;
      DELETE = mod.DELETE;
      PUT    = mod.PUT;
    });
    
    // THEN import
    
    // Now this works:
    beforeEach(() => {
      (getCurrentUser as jest.Mock).mockReturnValue({
        id: USER_ID,   // ← must match MOCK_COMMENT.userId exactly
        role: 'citizen',
        name: 'Jaspreet',
      });
    });
  
    // ── GET comments ──────────────────────────────────────────────────────────
    describe('GET', () => {
      test('returns 200 with comments array', async () => {
        mockFindOne.mockResolvedValueOnce({ comments: [MOCK_COMMENT] });
        const req = new NextRequest(`http://localhost:3000/api/issues/${ISSUE_ID}/comments`);
        const res = await GET(req, mockParams);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body[0].id).toBe(COMMENT_ID);
      });
  
      test('returns empty array when issue has no comments', async () => {
        mockFindOne.mockResolvedValueOnce({ comments: [] });
        const req = new NextRequest(`http://localhost:3000/api/issues/${ISSUE_ID}/comments`);
        const res = await GET(req, mockParams);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual([]);
      });
  
      test('returns 404 when issue not found', async () => {
        mockFindOne.mockResolvedValueOnce(null);
        const req = new NextRequest(`http://localhost:3000/api/issues/${ISSUE_ID}/comments`);
        const res = await GET(req, mockParams);
        expect(res.status).toBe(404);
      });
  
      test('returns comments sorted newest first', async () => {
        const olderId = '507f1f77bcf86cd799439040';
        const newerId = '507f1f77bcf86cd799439050';
        const older = { ...MOCK_COMMENT, id: olderId, createdAt: '2024-01-10T10:00:00.000Z' };
        const newer = { ...MOCK_COMMENT, id: newerId, createdAt: '2024-01-20T10:00:00.000Z' };
        
        mockFindOne.mockResolvedValueOnce({ comments: [older, newer] });
        const req = new NextRequest(`http://localhost:3000/api/issues/${ISSUE_ID}/comments`);
        const res = await GET(req, mockParams);
        const body = await res.json();
        
        expect(body[0].id).toBe(newerId); // newer first ✓
        expect(body[1].id).toBe(olderId);
      });
    });
  
    // ── POST comment ──────────────────────────────────────────────────────────
    describe('POST', () => {
      beforeEach(() => {
        (getCurrentUser as jest.Mock).mockReturnValue({
          id: USER_ID,
          role: 'citizen',
          name: 'Jaspreet',
        });
        mockFindOne.mockReset();        // ← Add this
        mockUpdateOne.mockReset();
        (notifyReporterNewComment as jest.Mock).mockClear();
      });

      test('returns 401 when unauthenticated', async () => {
        (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
        const res = await POST(makeRequest({ text: 'Hello' }), mockParams);
        expect(res.status).toBe(401);
      });
  
      test('returns 400 when text is empty', async () => {
        mockFindOne.mockResolvedValueOnce({ _id: ISSUE_ID, comments: [] });
        const res = await POST(makeRequest({ text: '   ' }), mockParams);
        expect(res.status).toBe(400);
        expect((await res.json()).message).toMatch(/text is required/i);
      });
  
      test('returns 404 when issue not found', async () => {
        mockFindOne.mockReset(); // ← reset completely before this test
        mockFindOne.mockResolvedValueOnce(null);
        const res = await POST(makeRequest({ text: 'Hii' }), mockParams);
        expect(res.status).toBe(404);
      });
  
      test('returns 201 with new comment on success', async () => {
        mockFindOne
          .mockResolvedValueOnce({ _id: ISSUE_ID, reporterId: 'other-user', comments: [] })
          .mockResolvedValueOnce(null) // avatar lookup
        ;
        mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
  
        const res = await POST(makeRequest({ text: 'This is a comment' }), mockParams);
        expect(res.status).toBe(201);
        const body = await res.json();
        expect(body.text).toBe('This is a comment');
        expect(body.user.name).toBe('Jaspreet');
      });
  
      test('does not notify reporter when commenter IS the reporter', async () => {
        // Clear previous mocks to prevent pollution
        mockFindOne.mockReset();
        
        mockFindOne
          .mockResolvedValueOnce({
            _id: ISSUE_ID,
            reporterId: USER_ID,        // Same as current user
            title: 'Great issue report!',
            comments: []
          })
          .mockResolvedValueOnce(null); // avatar lookup
      
        mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
      
        await POST(makeRequest({ text: 'My own issue' }), mockParams);
      
        expect(notifyReporterNewComment).not.toHaveBeenCalled();
      });
  
      test('notifies reporter when a different user comments', async () => {
        mockFindOne
          .mockResolvedValueOnce({ _id: ISSUE_ID, reporterId: 'different-reporter', title: 'Pothole', comments: [] })
          .mockResolvedValueOnce(null);
        mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
      
        await POST(makeRequest({ text: 'Good report!' }), mockParams);
        
        // Call the mock directly to check it was called with right args
        expect(notifyReporterNewComment).toHaveBeenCalledWith(
          'different-reporter',
          ISSUE_ID,
          'Pothole',
          'Jaspreet',       // ← matches getCurrentUser name from beforeEach
          'Good report!'
        );
      });
    });
  
    // ── DELETE comment ────────────────────────────────────────────────────────
    describe('DELETE', () => {
      function makeDeleteRequest(commentId: string) {
        return new NextRequest(
          `http://localhost:3000/api/issues/${ISSUE_ID}/comments?commentId=${commentId}`,
          { method: 'DELETE' }
        );
      }
  
      test('returns 401 when unauthenticated', async () => {
        (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
        const res = await DELETE(makeDeleteRequest(COMMENT_ID), mockParams);
        expect(res.status).toBe(401);
      });
  
      test('returns 400 when commentId is missing from query', async () => {
        const req = new NextRequest(
          `http://localhost:3000/api/issues/${ISSUE_ID}/comments`,
          { method: 'DELETE' }
        );
        const res = await DELETE(req, mockParams);
        expect(res.status).toBe(400);
      });
  
      test('returns 404 when comment not found in issue', async () => {
        mockFindOne.mockResolvedValueOnce({ comments: [] }); // comment not in array
        const res = await DELETE(makeDeleteRequest('nonexistent'), mockParams);
        expect(res.status).toBe(404);
      });
  
      test('returns 403 when non-author tries to delete', async () => {
        (getCurrentUser as jest.Mock).mockReturnValueOnce({
          id: 'different-user', role: 'citizen', name: 'Other'
        });
        mockFindOne.mockResolvedValueOnce({
          comments: [{ ...MOCK_COMMENT, userId: USER_ID }] // owned by USER_ID
        });
        const res = await DELETE(makeDeleteRequest(COMMENT_ID), mockParams);
        expect(res.status).toBe(403);
      });
  
      test('allows admin to delete any comment', async () => {
        (getCurrentUser as jest.Mock).mockReturnValueOnce({
          id: 'admin001', role: 'admin', name: 'Admin'
        });
        mockFindOne.mockResolvedValueOnce({
          comments: [{ ...MOCK_COMMENT, userId: USER_ID }]
        });
        mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
  
        const res = await DELETE(makeDeleteRequest(COMMENT_ID), mockParams);
        expect(res.status).toBe(200);
      });
  
      test('returns 200 when author deletes their own comment', async () => {
        mockFindOne.mockResolvedValueOnce({
          comments: [MOCK_COMMENT]
        });
        mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
  
        const res = await DELETE(makeDeleteRequest(COMMENT_ID), mockParams);
        expect(res.status).toBe(200);
        expect((await res.json()).message).toMatch(/deleted successfully/i);
      });
    });
  
    // ── PUT (edit) comment ────────────────────────────────────────────────────
    describe('PUT', () => {
      function makeEditRequest(commentId: string, text: string) {
        return new NextRequest(
          `http://localhost:3000/api/issues/${ISSUE_ID}/comments?commentId=${commentId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          }
        );
      }
  
      test('returns 401 when unauthenticated', async () => {
        (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
        const res = await PUT(makeEditRequest(COMMENT_ID, 'Updated'), mockParams);
        expect(res.status).toBe(401);
      });
  
      test('returns 400 when updated text is empty', async () => {
        mockFindOne.mockResolvedValueOnce({ comments: [MOCK_COMMENT] });
        const res = await PUT(makeEditRequest(COMMENT_ID, '   '), mockParams);
        expect(res.status).toBe(400);
      });

      test('returns 403 when non-author tries to edit', async () => {
        (getCurrentUser as jest.Mock).mockReturnValueOnce({
          id: 'other', role: 'citizen', name: 'Other'
        });
        mockFindOne.mockResolvedValueOnce({ comments: [MOCK_COMMENT] });
        const res = await PUT(makeEditRequest(COMMENT_ID, 'Edit'), mockParams);
        expect(res.status).toBe(403);
      });
  
      test('sets isEdited to true after editing', async () => {
        mockFindOne.mockResolvedValueOnce({ 
          _id: ISSUE_ID, 
          comments: [MOCK_COMMENT] 
        });
      
        mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
      
        const res = await PUT(makeEditRequest(COMMENT_ID, 'Updated text'), mockParams);
        
        expect(res.status).toBe(200);
        const body = await res.json();
        
        expect(body.isEdited).toBe(true);
        expect(body.text).toBe('Updated text');
      });
    });
  });