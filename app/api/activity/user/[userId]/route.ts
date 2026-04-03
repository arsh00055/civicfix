// app/api/activity/user/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    const { db } = await connectToDatabase();

    const activities = await db.collection('activities')
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    const formattedActivities = activities.map(activity => ({
      id: activity._id.toString(),
      type: activity.type,
      message: activity.message,
      time: formatRelativeTime(activity.createdAt),
      timestamp: activity.createdAt,
      user: activity.userName,
      metadata: activity.metadata || {},
    }));

    const total = await db.collection('activities').countDocuments({ userId });

    return NextResponse.json({
      activities: formattedActivities,
      total,
    });

  } catch (error) {
    console.error('GET /api/activity/user/[userId] error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user activities' },
      { status: 500 }
    );
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}