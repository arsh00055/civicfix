// app/api/analytics/platform-metrics/route.ts
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

    // Get platform metrics
    const [totalUsers, totalIssues, totalComments, totalVotes] = await Promise.all([
      db.collection('citizens').countDocuments(),
      db.collection('issues').countDocuments(),
      db.collection('issues').aggregate([{ $group: { _id: null, total: { $sum: '$commentsCount' } } }]).toArray(),
      db.collection('issues').aggregate([{ $group: { _id: null, total: { $sum: '$upvotes' } } }]).toArray(),
    ]);

    // Get engagement rate (users who have at least one action)
    const activeUsers = await db.collection('citizens').countDocuments({
      $or: [
        { 'stats.totalReports': { $gt: 0 } },
        { 'stats.totalVotes': { $gt: 0 } },
        { 'stats.totalComments': { $gt: 0 } },
      ]
    });

    const engagementRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

    // Get average response time (for resolved issues)
    const avgResponseTime = await db.collection('issues').aggregate([
      { $match: { resolvedAt: { $exists: true }, createdAt: { $exists: true } } },
      { $project: { responseTime: { $subtract: [{ $toDate: '$resolvedAt' }, { $toDate: '$createdAt' }] } } },
      { $group: { _id: null, avgTime: { $avg: '$responseTime' } } }
    ]).toArray();

    const avgTimeMs = avgResponseTime[0]?.avgTime || 0;
    const avgResponseHours = Math.round(avgTimeMs / (1000 * 60 * 60));

    // Get top categories
    const topCategories = await db.collection('issues').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    // Get daily active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyActive = await db.collection('citizens').countDocuments({
      lastLoginAt: { $gte: thirtyDaysAgo.toISOString() }
    });

    return NextResponse.json({
      totalUsers,
      totalIssues,
      totalComments: totalComments[0]?.total || 0,
      totalVotes: totalVotes[0]?.total || 0,
      engagementRate,
      avgResponseTimeHours: avgResponseHours,
      topCategories: topCategories.map(c => ({ category: c._id, count: c.count })),
      dailyActiveUsers: dailyActive,
      weeklyActiveUsers: await db.collection('citizens').countDocuments({
        lastLoginAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
      }),
      monthlyActiveUsers: await db.collection('citizens').countDocuments({
        lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
      }),
    });

  } catch (error) {
    console.error('GET /api/analytics/platform-metrics error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch platform metrics' },
      { status: 500 }
    );
  }
}