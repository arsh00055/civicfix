// app/api/users/profile/route.ts
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

// GET /api/users/profile - Get current user's profile
export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const userData = await db.collection('citizens').findOne(
      { _id: new ObjectId(user.id) },
      { 
        projection: { 
          password: 0,
          'metadata.deviceInfo': 0,
        } 
      }
    );

    if (!userData) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { _id, ...rest } = userData;
    return NextResponse.json({ id: _id.toString(), ...rest });
  } catch (error) {
    console.error('GET /api/users/profile error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT /api/users/profile - Update current user's profile
export async function PUT(req: NextRequest) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, avatar, profile, preferences } = body;

    const { db } = await connectToDatabase();
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;
    if (profile) updateData.profile = { ...profile };
    if (preferences) updateData.preferences = { ...preferences };

    const result = await db.collection('citizens').updateOne(
      { _id: new ObjectId(user.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const updatedUser = await db.collection('citizens').findOne(
      { _id: new ObjectId(user.id) },
      { projection: { password: 0 } }
    );

    const { _id, ...rest } = updatedUser!;
    return NextResponse.json({ id: _id.toString(), ...rest });
  } catch (error) {
    console.error('PUT /api/users/profile error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}