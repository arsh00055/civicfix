// app/api/admin/analytics/issues/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
export async function GET(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    const totalIssues = await db.collection('issues').countDocuments();
    const openIssues = await db.collection('issues').countDocuments({ status: { $nin: ['resolved', 'closed'] } });
    const resolvedIssues = await db.collection('issues').countDocuments({ status: 'resolved' });
    const inProgressIssues = await db.collection('issues').countDocuments({ status: 'in_progress' });
    
    const issuesByPriority = await db.collection('issues').aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    const averageResolutionTime = await db.collection('issues').aggregate([
      { $match: { status: 'resolved', resolvedAt: { $exists: true }, createdAt: { $exists: true } } },
      { $project: { resolutionTime: { $subtract: [{ $toDate: '$resolvedAt' }, { $toDate: '$createdAt' }] } } },
      { $group: { _id: null, avgTime: { $avg: '$resolutionTime' } } }
    ]).toArray();
    
    const avgTimeMs = averageResolutionTime[0]?.avgTime || 0;
    const avgHours = Math.round(avgTimeMs / (1000 * 60 * 60));
    
    return NextResponse.json({
      totalIssues,
      openIssues,
      resolvedIssues,
      inProgressIssues,
      issuesByPriority: issuesByPriority.map(item => ({ priority: item._id, count: item.count })),
      averageResolutionTime: `${avgHours} hours`,
    });
  } catch (error) {
    console.error('GET /api/admin/analytics/issues error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch issue analytics' },
      { status: 500 }
    );
  }
}