// app/api/activity/recent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch recent activities from the activities collection
    const activities = await db.collection('activities')
      .find({})
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    // Format activities
    const formattedActivities = activities.map(activity => ({
      id: activity._id.toString(),
      type: activity.type,
      message: activity.message,
      time: formatRelativeTime(activity.createdAt),
      timestamp: activity.createdAt,
      user: activity.userName || 'System',
      metadata: activity.metadata || {},
    }));

    return NextResponse.json({
      activities: formattedActivities,
      total: await db.collection('activities').countDocuments(),
    });

  } catch (error) {
    console.error('GET /api/activity/recent error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch activities' },
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