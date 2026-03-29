// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getCurrentUser(req: NextRequest): { id: string; role: string } | null {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies.get('auth_token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { id: decoded.id || decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Users can view their own profile, admins can view any
    if (user.role !== 'admin' && user.id !== id) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    if(user.role === 'citizen'){
      const userData = await db.collection('citizens').findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
      );

      if (!userData) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
  
      const { _id, ...rest } = userData;
      return NextResponse.json({ id: _id.toString(), ...rest });
    }
    else if( user.role === 'volunteer'){
      const userData = await db.collection('volunteers').findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
      );

      if (!userData) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
  
      const { _id, ...rest } = userData;
      return NextResponse.json({ id: _id.toString(), ...rest });
    }
    else{
      const userData = await db.collection('admins').findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
      );

      if (!userData) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
  
      const { _id, ...rest } = userData;
      return NextResponse.json({ id: _id.toString(), ...rest });
    }
  } catch (error) {
    console.error('GET /api/users/[id] error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}