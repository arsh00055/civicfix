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

  const admin = await db.collection('admins').findOne({ role: 'admin' });

  if (!admin) {
    return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
  }

  return NextResponse.json({ email: admin.email });
}