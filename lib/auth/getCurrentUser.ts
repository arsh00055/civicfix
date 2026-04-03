import { verifyToken } from './jwt';
import type { NextRequest } from 'next/server';

export function getCurrentUser(req: NextRequest) {
  try {
    const token =
      req.headers.get('authorization')?.slice(7) ??
      req.cookies.get('auth_token')?.value;
    if (!token) return null;
    const decoded = verifyToken(token) as any;
    return { id: decoded.id ?? decoded.userId, role: decoded.role, name: decoded.name };
  } catch { return null; }
}