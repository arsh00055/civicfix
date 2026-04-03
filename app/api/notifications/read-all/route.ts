// app/api/notifications/read-all/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function PATCH(req: NextRequest) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('notifications').updateMany(
      {
        $or: [
          { targetType: 'broadcast' },
          { targetUserId: user.id }
        ],
        isRead: false,
        isArchived: false
      },
      { $set: { isRead: true, updatedAt: new Date().toISOString() } }
    );

    return NextResponse.json({ 
      success: true, 
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('PATCH /api/notifications/read-all error:', error);
    return NextResponse.json(
      { message: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}