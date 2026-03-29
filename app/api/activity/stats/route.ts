// app/api/activity/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getCurrentUser(req: NextRequest): { id: string; role: string; name: string } | null {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies.get('auth_token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { id: decoded.id || decoded.userId, role: decoded.role, name: decoded.name };
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