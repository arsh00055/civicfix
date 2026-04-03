// app/api/analytics/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Allow all authenticated users (citizen, volunteer, admin)
    // Removed admin-only restriction

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
    
    // Get user-specific stats
    let userStats = null;
    if (currentUser.role === 'citizen') {
      const citizenData = await db.collection('citizens').findOne(
        { _id: new ObjectId(currentUser.id) },
        { projection: { stats: 1, name: 1, email: 1, createdAt: 1 } }
      );
      if (citizenData) {
        userStats = {
          reportsSubmitted: citizenData.stats?.totalReports || 0,
          issuesResolved: citizenData.stats?.resolvedReports || 0,
          totalVotes: citizenData.stats?.totalVotes || 0,
          totalComments: citizenData.stats?.totalComments || 0,
          points: citizenData.stats?.points || 0,
          level: citizenData.stats?.level || 1,
          memberSince: citizenData.createdAt,
        };
      }
    } else if (currentUser.role === 'volunteer') {
      const volunteerData = await db.collection('citizens').findOne(
        { _id: new ObjectId(currentUser.id) },
        { projection: { stats: 1, volunteerStats: 1, name: 1, email: 1, createdAt: 1 } }
      );
      if (volunteerData) {
        userStats = {
          tasksClaimed: volunteerData.volunteerStats?.totalClaimed || 0,
          tasksCompleted: volunteerData.volunteerStats?.tasksCompleted || 0,
          rating: volunteerData.volunteerStats?.averageRating || 0,
          points: volunteerData.stats?.points || 0,
          level: volunteerData.stats?.level || 1,
          memberSince: volunteerData.createdAt,
        };
      }
    }
    
    // Get community stats (accessible to all)
    const [totalUsers, totalIssues, resolvedIssues, activeVolunteers] = await Promise.all([
      db.collection('citizens').countDocuments({ isActive: true }),
      db.collection('issues').countDocuments(),
      db.collection('issues').countDocuments({ status: 'resolved' }),
      db.collection('volunteers').countDocuments({ role: 'volunteer', isActive: true }),
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
    
    // Return role-specific response
    const response: any = {
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
    };
    
    // Add user-specific stats if available
    if (userStats) {
      response.userStats = userStats;
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('GET /api/analytics/overview error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}