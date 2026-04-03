// app/api/users/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const { db } = await connectToDatabase();

    const users = await db.collection('citizens')
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } },
        ],
      })
      .limit(limit)
      .toArray();

    const formattedUsers = users.map(user => {
      const { _id, password, ...rest } = user;
      return { id: _id.toString(), ...rest };
    });

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('GET /api/users/search error:', error);
    return NextResponse.json(
      { message: 'Failed to search users' },
      { status: 500 }
    );
  }
}