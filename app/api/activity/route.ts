// app/api/activity/route.ts
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

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, message, metadata } = body;

    if (!type || !message) {
      return NextResponse.json(
        { message: 'Type and message are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const activity = {
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      type,
      message,
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection('activities').insertOne(activity);

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...activity,
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/activity error:', error);
    return NextResponse.json(
      { message: 'Failed to create activity' },
      { status: 500 }
    );
  }
}