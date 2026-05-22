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

export const mockFindOne = jest.fn();
export const mockUpdateOne = jest.fn();
export const mockCountDocuments = jest.fn();
export const mockInsertOne = jest.fn().mockResolvedValue({
  acknowledged: true, insertedId: 'mock-id'
});

mockUpdateOne.mockResolvedValue({
  matchedCount: 1,
  modifiedCount: 1,
  acknowledged: true
});

export const mockFind = jest.fn();

// ✅ FIX: skip + limit added to chain so find().sort().skip().limit().toArray() works
export const mockChain = {
  project: jest.fn().mockReturnThis(),
  sort:    jest.fn().mockReturnThis(),
  skip:    jest.fn().mockReturnThis(),
  limit:   jest.fn().mockReturnThis(),
  toArray: jest.fn().mockResolvedValue([]),
};

mockFind.mockReturnValue(mockChain);

// ✅ FIX: sort, skip, limit, toArray also exposed directly on mockCollection
//         so tests can do mockCollection.sort.mockReturnThis() in beforeEach
export const mockCollection = {
  findOne:        mockFindOne,
  updateOne:      mockUpdateOne,
  insertOne:      mockInsertOne,
  find:           mockFind,
  sort:           mockChain.sort,
  skip:           mockChain.skip,
  limit:          mockChain.limit,
  toArray:        mockChain.toArray,
  countDocuments: mockCountDocuments,
  deleteOne:      jest.fn().mockResolvedValue({ deletedCount: 1 }),
  aggregate:      jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
};

export const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollection),
};

export const connectToDatabase = jest.fn().mockResolvedValue({ db: mockDb });

jest.mock('@/lib/db', () => ({
  connectToDatabase,
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

import { NextRequest } from "next/server";

export function validObjectId(): string {
  return '507f1f77bcf86cd799439011';
}

export function makeRequest(body: object, method = 'POST') {
  return new NextRequest('http://localhost:3000/api', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function makeGetRequest(url: string): NextRequest {
  return new (NextRequest as any)(url, { method: 'GET' });
}