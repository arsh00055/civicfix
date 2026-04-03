// app/api/notifications/unread/count/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

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