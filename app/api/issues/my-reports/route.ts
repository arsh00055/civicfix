import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

function normaliseIssue(doc: any) {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const page   = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit  = Math.min(50, parseInt(searchParams.get('limit') || '10'));

    const filter: Record<string, any> = { reporterId: user.id };
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { title:    { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const { db } = await connectToDatabase();
    const skip = (page - 1) * limit;

    const [issues, total] = await Promise.all([
      db.collection('issues')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('issues').countDocuments(filter),
    ]);

    return NextResponse.json({
      issues: issues.map(normaliseIssue),
      total,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error('GET /api/issues/my-reports error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch your reports', error: error.message },
      { status: 500 }
    );
  }
}