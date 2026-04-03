// app/api/activity/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCurrentUser } from "@/lib/auth/getCurrentUser";


export async function GET(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await db.collection('activities').aggregate([
      { $match: { createdAt: { $gte: startDate.toISOString() } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]).toArray();

    const dailyStats = await db.collection('activities').aggregate([
      { $match: { createdAt: { $gte: startDate.toISOString() } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$createdAt' } } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    return NextResponse.json({
      total: stats.reduce((sum, s) => sum + s.count, 0),
      byType: stats,
      daily: dailyStats,
    });

  } catch (error) {
    console.error('GET /api/activity/stats error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch activity stats' },
      { status: 500 }
    );
  }
}