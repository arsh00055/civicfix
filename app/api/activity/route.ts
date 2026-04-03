// app/api/activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function POST(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
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
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
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