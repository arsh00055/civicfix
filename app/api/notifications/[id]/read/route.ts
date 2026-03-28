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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { db } = await connectToDatabase();

    // ✅ Fixed: The $or should be an array of conditions
    const result = await db.collection('notifications').updateOne(
      { 
        _id: new ObjectId(id),
        $or: [
          { targetType: 'broadcast' },
          { targetUserId: user.id }
        ]
      },
      { $set: { isRead: true, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/notifications/[id]/read error:', error);
    return NextResponse.json(
      { message: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}