import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/lib/email'; // 👈 ADD THIS

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params; // 👈 FIX: rename to userId
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

    // 👇 STEP 1: Find user in which collection
    let userData = await db.collection('citizens').findOne({ _id: new ObjectId(userId) });
    let currentCollection = 'citizens';
    let oldRole = 'citizen';

    if (!userData) {
      userData = await db.collection('volunteers').findOne({ _id: new ObjectId(userId) });
      currentCollection = 'volunteers';
      oldRole = 'volunteer';
    }

    if (!userData) {
      userData = await db.collection('admins').findOne({ _id: new ObjectId(userId) });
      currentCollection = 'admins';
      oldRole = 'admin';
    }

    if (!userData) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 👇 STEP 2: If role is same, return
    if (oldRole === role) {
      return NextResponse.json({ 
        success: true, 
        message: `User is already a ${role}` 
      });
    }

    // 👇 STEP 3: Update in current collection
    const updateResult = await db.collection(currentCollection).updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role: role,
          updatedAt: new Date().toISOString(),
        } 
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 👇 STEP 4: Send email to user about role change
    const roleDisplayNames = {
      citizen: 'Citizen',
      volunteer: 'Volunteer',
      admin: 'Administrator'
    };


    // 👇 STEP 5: Create activity record
    await db.collection('activities').insertOne({
      userId: user.id,
      userName: user.name,
      type: 'role_updated',
      message: `${user.name} changed ${userData.name}'s role from ${oldRole} to ${role}`,
      metadata: {
        targetUserId: userId,
        targetUserName: userData.name,
        oldRole: oldRole,
        newRole: role,
      },
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Role updated: ${userData.name} from ${oldRole} to ${role}`);

    return NextResponse.json({ 
      success: true, 
      message: `User role updated from ${oldRole} to ${role}` 
    });
    
  } catch (error) {
    console.error('PATCH /api/admin/users/[userId]/role error:', error);
    return NextResponse.json(
      { message: 'Failed to update user role' },
      { status: 500 }
    );
  }
}