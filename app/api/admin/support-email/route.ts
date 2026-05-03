import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = getCurrentUser(req);
  if (!user || user.role !== 'volunteer') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { db } = await connectToDatabase();

  const settings = await db.collection('systemSettings').findOne();

  if (!settings) {
    return NextResponse.json({ message: 'System Settings not found' }, { status: 404 });
  }

  return NextResponse.json({ email: settings.supportEmail });
}