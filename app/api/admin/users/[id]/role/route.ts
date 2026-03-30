import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only admins can update user roles' },
        { status: 403 }
      );
    }

    const { userId } = await params;
    const body = await req.json();
    const { role } = body;

    if (!role || !['citizen', 'volunteer', 'admin'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role. Must be citizen, volunteer, or admin' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    const result = await db.collection('citizens').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role,
          updatedAt: new Date().toISOString(),
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Create activity record for role change
    await db.collection('activities').insertOne({
      userId: user.id,
      userName: user.name,
      type: 'role_updated',
      message: `${user.name} changed user role to ${role}`,
      metadata: {
        targetUserId: userId,
        newRole: role,
      },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'User role updated' });
  } catch (error) {
    console.error('PATCH /api/admin/users/[userId]/role error:', error);
    return NextResponse.json(
      { message: 'Failed to update user role' },
      { status: 500 }
    );
  }
}