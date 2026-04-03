// app/api/analytics/geographic/route.ts
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
    
    const issuesByCity = await db.collection('issues').aggregate([
      { $match: { city: { $exists: true, $ne: null } } },
      { $group: { _id: '$city', count: { $sum: 1 }, latitude: { $first: '$latitude' }, longitude: { $first: '$longitude' } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]).toArray();
    
    const issuesByState = await db.collection('issues').aggregate([
      { $match: { state: { $exists: true, $ne: null } } },
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    return NextResponse.json({
      byCity: issuesByCity.map(item => ({
        city: item._id,
        count: item.count,
        latitude: item.latitude,
        longitude: item.longitude,
      })),
      byState: issuesByState.map(item => ({
        state: item._id,
        count: item.count,
      })),
    });
  } catch (error) {
    console.error('GET /api/analytics/geographic error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch geographic data' },
      { status: 500 }
    );
  }
}