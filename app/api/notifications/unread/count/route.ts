// app/api/notifications/unread/count/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getCurrentUser(req: NextRequest): { id: string; role: string } | null {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies.get('auth_token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { id: decoded.id || decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    const filter: any = {
      $or: [
        { targetType: 'broadcast' },
        { targetUserId: user.id }
      ],
      isRead: false,
      isArchived: false
    };

    const count = await db.collection('notifications').countDocuments(filter);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('GET /api/notifications/unread/count error:', error);
    return NextResponse.json(
      { message: 'Failed to get unread count' },
      { status: 500 }
    );
  }
}