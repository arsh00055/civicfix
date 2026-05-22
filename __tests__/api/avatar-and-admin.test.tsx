/**
 * @jest-environment node
 */

jest.mock('@/lib/auth/getCurrentUser', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('next/server', () => {
class MockHeaders {
  private headers = new Map<string, string>();

  constructor(init?: HeadersInit) {
    if (init) {
      if (init instanceof Map) {
        init.forEach((value, key) => this.headers.set(key.toLowerCase(), value));
      } else if (typeof (init as any).forEach === 'function') {
        (init as any).forEach((value: string, key: string) => {
          this.headers.set(key.toLowerCase(), value);
        });
      } else {
        Object.entries(init).forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), value);
        });
      }
    }
  }

  get(name: string) { return this.headers.get(name.toLowerCase()) || null; }
  set(name: string, value: string) { this.headers.set(name.toLowerCase(), value); }
  has(name: string) { return this.headers.has(name.toLowerCase()); }
  forEach(callback: (value: string, key: string) => void) {
    this.headers.forEach(callback);
  }
}

class MockNextRequest {
  public url: string;
  public method: string;
  public headers: MockHeaders;
  private bodyText: string | null = null;
  private formDataValue: FormData | null = null;

  constructor(input: string | URL, init: RequestInit = {}) {
    this.url = input.toString();
    this.method = init.method || 'GET';
    this.headers = new MockHeaders(init.headers);

    if (init.body) {
      if (init.body instanceof FormData) {
        this.formDataValue = init.body;
      } else if (typeof init.body === 'string') {
        this.bodyText = init.body;
      } else {
        this.bodyText = JSON.stringify(init.body);
      }
    }
  }

  async json() {
    return this.bodyText ? JSON.parse(this.bodyText) : {};
  }

  async text() {
    return this.bodyText || '';
  }

  async formData(): Promise<FormData> {
    if (this.formDataValue) return this.formDataValue;
    throw new Error('No FormData available in mock');
  }

  async blob() {
    return new Blob();
  }
}

const actual = jest.requireActual('next/server');

return {
  ...actual,
  NextRequest: MockNextRequest,
  NextResponse: Object.assign(
    jest.fn().mockImplementation((body?: any, init?: any) => {
      const headers = new MockHeaders(init?.headers);
      return {
        status: init?.status || 200,
        headers,
        json: async () => body,
        text: async () => JSON.stringify(body),
        body,
        ok: (init?.status || 200) < 400,
      };
    }),
    {
      json: (data: any, init?: any) => {
        const headers = new MockHeaders(init?.headers);
        return {
          status: init?.status || 200,
          headers,
          json: async () => data,
          text: async () => JSON.stringify(data),
        };
      }
    }
  ),
};
});

class MockFile extends File {
async arrayBuffer(): Promise<ArrayBuffer> {
  return new ArrayBuffer(this.size);
}
}

import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { NextRequest } from 'next/server';
import { mockFindOne, mockInsertOne, mockUpdateOne, mockDb, makeGetRequest } from '../db/mongodb';

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD AVATAR — POST /api/upload/avatar
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/upload/avatar', () => {
  let POST: (req: NextRequest) => Promise<Response>;
 
  beforeAll(async () => {
    ({ POST } = await import('@/app/api/upload/avatar/route'));
  });
 
  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentUser as jest.Mock).mockReturnValue({
      id: '507f1f77bcf86cd799439011',
      role: 'citizen',
      name: 'Jaspreet',
    });
  });
 
  function makeFormDataRequest(fileOptions?: { name?: string; type?: string; size?: number }): NextRequest {
    const { name = 'avatar.jpg', type = 'image/jpeg', size = 1024 } = fileOptions || {};
    const formData = new FormData();
    const file = new MockFile(['x'.repeat(size)], name, { type });
    formData.append('file', file);
    formData.append('userId', 'user123');
    return new NextRequest('http://localhost:3000/api/upload/avatar', {
      method: 'POST',
      body: formData,
    });
  }
 
  test('returns 401 when unauthenticated', async () => {
    (getCurrentUser as jest.Mock).mockReturnValueOnce(null);
    const res = await POST(makeFormDataRequest());
    expect(res.status).toBe(401);
  });
 
  test('returns 400 when no file is provided', async () => {
    const formData = new FormData();
    const req = new NextRequest('http://localhost:3000/api/upload/avatar', {
      method: 'POST',
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/no file/i);
  });
 
  test('returns 400 for unsupported file type', async () => {
    const res = await POST(makeFormDataRequest({ type: 'application/pdf', name: 'doc.pdf' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/invalid file type/i);
  });
 
  test('returns 400 when file exceeds 5MB', async () => {
    const fiveMBPlusOne = 5 * 1024 * 1024 + 1;
    const res = await POST(makeFormDataRequest({ size: fiveMBPlusOne }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/less than 5mb/i);
  });
 
  test('inserts new avatar when none exists', async () => {
    mockFindOne.mockResolvedValueOnce(null);
    mockInsertOne.mockResolvedValueOnce({ acknowledged: true });
    mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
  
    const res = await POST(makeFormDataRequest());
    expect(res.status).toBe(200);
    
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.avatar).toContain('/api/upload/avatar?userId=507f1f77bcf86cd799439011');
    expect(body.data.avatar).toContain('&t=');
    expect(mockInsertOne).toHaveBeenCalled();
  });
 
  test('updates existing avatar when one already exists', async () => {
    mockFindOne.mockResolvedValueOnce({ _id: 'existingId', data: Buffer.from('old') });
    mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
 
    const res = await POST(makeFormDataRequest());
    expect(res.status).toBe(200);
    expect(mockUpdateOne).toHaveBeenCalled();
    expect(mockInsertOne).not.toHaveBeenCalled();
  });
 
  test('updates the correct user collection based on role', async () => {
    (getCurrentUser as jest.Mock).mockReturnValue({
      id: '507f1f77bcf86cd799439012', role: 'volunteer', name: 'Arshdeep',
    });
    mockFindOne.mockResolvedValue(null);
    mockInsertOne.mockResolvedValue({ acknowledged: true });
    mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });
 
    await POST(makeFormDataRequest());
    expect(mockDb.collection).toHaveBeenCalledWith('volunteers');
  });
});
 
// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD AVATAR — GET /api/upload/avatar?userId=xxx
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /api/upload/avatar', () => {
  let GET: (req: NextRequest) => Promise<Response>;
 
  const VALID_USER_ID = '507f1f77bcf86cd799439011';
 
  beforeAll(async () => {
    ({ GET } = await import('@/app/api/upload/avatar/route'));
  });
 
  beforeEach(() => jest.clearAllMocks());
 
  test('returns 400 for missing userId', async () => {
    const res = await GET(makeGetRequest('http://localhost:3000/api/upload/avatar'));
    expect(res.status).toBe(400);
  });
 
  test('returns 400 for invalid userId format', async () => {
    const res = await GET(makeGetRequest('http://localhost:3000/api/upload/avatar?userId=not-an-id'));
    expect(res.status).toBe(400);
  });
 
  test('returns 404 when no avatar exists', async () => {
    mockFindOne.mockResolvedValueOnce(null);
    const res = await GET(makeGetRequest(`http://localhost:3000/api/upload/avatar?userId=${VALID_USER_ID}`));
    expect(res.status).toBe(404);
  });
 
  test('returns 200 with image buffer when avatar exists', async () => {
    const imageBuffer = Buffer.from('fake-image-data');
    mockFindOne.mockResolvedValueOnce({
      data:        imageBuffer,
      contentType: 'image/jpeg',
    });
    const res = await GET(makeGetRequest(`http://localhost:3000/api/upload/avatar?userId=${VALID_USER_ID}`));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/jpeg');
  });
 
  test('sets no-cache headers', async () => {
    mockFindOne.mockResolvedValueOnce({
      data: Buffer.from('img'),
      contentType: 'image/png',
    });
  
    const res = await GET(makeGetRequest(`http://localhost:3000/api/upload/avatar?userId=${VALID_USER_ID}`));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
    expect(res.headers.get('cache-control')).toContain('no-cache');
  });
});