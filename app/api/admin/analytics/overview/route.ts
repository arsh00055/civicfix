// app/api/analytics/overview/route.ts
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

    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only admins can access analytics' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || 'month';
    
    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    const startDateISO = startDate.toISOString();
    
    // Get overview stats
    const [totalUsers, totalIssues, resolvedIssues, activeVolunteers] = await Promise.all([
      db.collection('citizens').countDocuments({ isActive: true }),
      db.collection('issues').countDocuments(),
      db.collection('issues').countDocuments({ status: 'resolved' }),
      db.collection('citizens').countDocuments({ role: 'volunteer', isActive: true }),
    ]);
    
    // Get new users this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeek = await db.collection('citizens').countDocuments({
      createdAt: { $gte: weekAgo.toISOString() }
    });
    
    // Get issues this week
    const issuesThisWeek = await db.collection('issues').countDocuments({
      createdAt: { $gte: weekAgo.toISOString() }
    });
    
    // Issues by status
    const issuesByStatus = await db.collection('issues').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // Issues by category
    const issuesByCategory = await db.collection('issues').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    // User growth over time
    const userGrowth = await db.collection('citizens').aggregate([
      { $match: { createdAt: { $gte: startDateISO } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$createdAt' } } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    // Issue trends (reported vs resolved)
    const reportedTrends = await db.collection('issues').aggregate([
      { $match: { createdAt: { $gte: startDateISO } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$createdAt' } } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    const resolvedTrends = await db.collection('issues').aggregate([
      { $match: { resolvedAt: { $gte: startDateISO } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$resolvedAt' } } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    // Combine trends
    const dateMap = new Map();
    reportedTrends.forEach(t => dateMap.set(t._id, { reported: t.count, resolved: 0 }));
    resolvedTrends.forEach(t => {
      const existing = dateMap.get(t._id) || { reported: 0, resolved: 0 };
      dateMap.set(t._id, { reported: existing.reported, resolved: t.count });
    });
    
    const issueTrends = Array.from(dateMap.entries()).map(([date, values]) => ({
      date,
      reported: values.reported,
      resolved: values.resolved,
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    return NextResponse.json({
      overview: {
        totalUsers,
        totalIssues,
        resolvedIssues,
        activeVolunteers,
        newUsersThisWeek,
        issuesThisWeek,
      },
      issuesByStatus: issuesByStatus.map(item => ({ status: item._id, count: item.count })),
      issuesByCategory: issuesByCategory.map(item => ({ category: item._id, count: item.count })),
      userGrowth: userGrowth.map(item => ({ date: item._id, count: item.count })),
      issueTrends,
    });
    
  } catch (error) {
    console.error('GET /api/analytics/overview error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}