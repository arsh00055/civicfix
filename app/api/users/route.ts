// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can list all users
    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only admins can access user list' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    if (role && role !== 'all') filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    
    const [users, total] = await Promise.all([
      db.collection('citizens')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('citizens').countDocuments(filter),
    ]);
    
    const formattedUsers = users.map(user => {
      const { _id, password, ...rest } = user;
      return { id: _id.toString(), ...rest };
    });
    
    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}