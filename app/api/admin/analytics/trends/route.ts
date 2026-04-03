// app/api/analytics/trends/route.ts
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
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month'; // week, month, year

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let groupFormat: string;

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        groupFormat = '%Y-%m-%d'; // Daily
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        groupFormat = '%Y-%m-%d'; // Daily
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        groupFormat = '%Y-%m'; // Monthly
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        groupFormat = '%Y-%m-%d';
    }

    const startDateISO = startDate.toISOString();

    // Issues created over time
    const issuesCreated = await db.collection('issues').aggregate([
      {
        $match: {
          createdAt: { $gte: startDateISO }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: { $toDate: '$createdAt' } } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Issues resolved over time
    const issuesResolved = await db.collection('issues').aggregate([
      {
        $match: {
          resolvedAt: { $gte: startDateISO },
          status: 'resolved'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: { $toDate: '$resolvedAt' } } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Users registered over time
    const userRegistration = await db.collection('citizens').aggregate([
      {
        $match: {
          createdAt: { $gte: startDateISO }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: { $toDate: '$createdAt' } } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Volunteers registered over time
    const volunteerRegistration = await db.collection('citizens').aggregate([
      {
        $match: {
          createdAt: { $gte: startDateISO },
          role: 'volunteer'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: { $toDate: '$createdAt' } } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Combine issues created and resolved
    const issueTrendsMap = new Map();
    issuesCreated.forEach(item => {
      issueTrendsMap.set(item._id, {
        date: item._id,
        created: item.count,
        resolved: 0
      });
    });
    issuesResolved.forEach(item => {
      const existing = issueTrendsMap.get(item._id) || { date: item._id, created: 0, resolved: 0 };
      issueTrendsMap.set(item._id, {
        date: item._id,
        created: existing.created,
        resolved: item.count
      });
    });

    // Combine user trends
    const userTrendsMap = new Map();
    userRegistration.forEach(item => {
      userTrendsMap.set(item._id, {
        date: item._id,
        citizens: item.count,
        volunteers: 0
      });
    });
    volunteerRegistration.forEach(item => {
      const existing = userTrendsMap.get(item._id) || { date: item._id, citizens: 0, volunteers: 0 };
      userTrendsMap.set(item._id, {
        date: item._id,
        citizens: existing.citizens,
        volunteers: item.count
      });
    });

    // Calculate weekly/monthly averages
    const issueTrends = Array.from(issueTrendsMap.entries()).map(([date, data]) => ({
      date,
      created: data.created,
      resolved: data.resolved,
      net: data.created - data.resolved
    })).sort((a, b) => a.date.localeCompare(b.date));

    const userTrends = Array.from(userTrendsMap.entries()).map(([date, data]) => ({
      date,
      citizens: data.citizens,
      volunteers: data.volunteers,
      total: data.citizens + data.volunteers
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate summary statistics
    const totalIssuesCreated = issuesCreated.reduce((sum, item) => sum + item.count, 0);
    const totalIssuesResolved = issuesResolved.reduce((sum, item) => sum + item.count, 0);
    const totalUsersRegistered = userRegistration.reduce((sum, item) => sum + item.count, 0);
    const totalVolunteersRegistered = volunteerRegistration.reduce((sum, item) => sum + item.count, 0);

    const avgDailyIssues = Math.round(totalIssuesCreated / issueTrends.length) || 0;
    const avgDailyResolved = Math.round(totalIssuesResolved / issueTrends.length) || 0;
    const resolutionRate = totalIssuesCreated > 0 
      ? Math.round((totalIssuesResolved / totalIssuesCreated) * 100) 
      : 0;

    // Get peak activity days
    const peakIssueDay = [...issueTrends].sort((a, b) => b.created - a.created)[0];
    const peakResolutionDay = [...issueTrends].sort((a, b) => b.resolved - a.resolved)[0];
    const peakUserRegistrationDay = [...userTrends].sort((a, b) => b.total - a.total)[0];

    return NextResponse.json({
      period,
      trends: {
        issues: issueTrends,
        users: userTrends
      },
      summary: {
        totalIssuesCreated,
        totalIssuesResolved,
        totalUsersRegistered,
        totalVolunteersRegistered,
        avgDailyIssues,
        avgDailyResolved,
        resolutionRate,
        peakIssueDay: peakIssueDay ? {
          date: peakIssueDay.date,
          count: peakIssueDay.created
        } : null,
        peakResolutionDay: peakResolutionDay ? {
          date: peakResolutionDay.date,
          count: peakResolutionDay.resolved
        } : null,
        peakUserRegistrationDay: peakUserRegistrationDay ? {
          date: peakUserRegistrationDay.date,
          count: peakUserRegistrationDay.total
        } : null
      }
    });

  } catch (error) {
    console.error('GET /api/analytics/trends error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch trends data' },
      { status: 500 }
    );
  }
}