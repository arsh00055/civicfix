// app/api/notifications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function DELETE(
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

    const result = await db.collection('notifications').deleteOne({
      _id: new ObjectId(id),
      $or: [
        { targetType: 'broadcast' },
        { targetUserId: user.id }
      ]
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/notifications/[id] error:', error);
    return NextResponse.json(
      { message: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}