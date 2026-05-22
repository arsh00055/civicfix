import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

import { Response, Headers, Request } from 'node-fetch';

if (!globalThis.Response) {
  globalThis.Response = Response as any;
}
if (!globalThis.Headers) {
  globalThis.Headers = Headers as any;
}
if (!globalThis.Request) {
  globalThis.Request = Request as any;
}

// eslint-disable-next-line no-secrets
process.env.JWT_SECRET = 'test-secret-do-not-use-in-production';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token-123'),
  verify: jest.fn().mockReturnValue({
    userId: '507f1f77bcf86cd799439011',
    role: 'citizen',
  }),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');

  function makeResponseWithHeaders(body: any, init?: any) {
    const headersMap: Record<string, string> = {};

    if (init?.headers) {
      const h = init.headers;
      if (h instanceof Headers) {
        h.forEach((v: string, k: string) => {
          headersMap[k.toLowerCase()] = v;
        });
      } else if (typeof h.get === 'function') {
        ['content-type', 'cache-control', 'pragma', 'expires', 'content-length'].forEach((k) => {
          const v = h.get(k);
          if (v) headersMap[k] = v;
        });
      } else {
        Object.entries(h).forEach(([k, v]) => {
          headersMap[k.toLowerCase()] = v as string;
        });
      }
    }

    return {
      status: init?.status || 200,
      headers: { get: (key: string) => headersMap[key.toLowerCase()] ?? null },
      json: async () => {
        try {
          return JSON.parse(body);
        } catch {
          return body;
        }
      },
    };
  }

  return {
    ...actual,
    NextResponse: Object.assign(jest.fn().mockImplementation(makeResponseWithHeaders), {
      json: (data: any, init?: any) => ({
        status: init?.status || 200,
        headers: { get: jest.fn().mockReturnValue(null) },
        json: async () => data,
        cookies: { set: jest.fn(), get: jest.fn(), delete: jest.fn() },
      }),
    }),
  };
});