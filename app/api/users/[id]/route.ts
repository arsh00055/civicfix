<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function getCurrentUser(req: NextRequest): { id: string; role: string; name: string } | null {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies.get('auth_token')?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { id: decoded.id || decoded.userId, role: decoded.role, name: decoded.name }
  } catch {
    return null
  }
}

// ============ GET /api/users/[id] ============
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Teeno collections mein dhundo
    let user = null
    let role = ''
    let collection = ''

    user = await db.collection('citizens').findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    )
    if (user) { role = 'citizen'; collection = 'citizens' }

    if (!user) {
      user = await db.collection('volunteers').findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
      )
      if (user) { role = 'volunteer'; collection = 'volunteers' }
    }

    if (!user) {
      user = await db.collection('admins').findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
      )
      if (user) { role = 'admin'; collection = 'admins' }
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Stats
    let stats = {
      issuesReported: 0,
      issuesResolved: 0,
      communityScore: 0,
    }

    if (role === 'citizen') {
      const [reported, resolved] = await Promise.all([
        db.collection('issues').countDocuments({ reporterId: id }),
        db.collection('issues').countDocuments({
          reporterId: id,
          status: { $in: ['resolved', 'closed'] }
        }),
      ])
      stats.issuesReported = reported
      stats.issuesResolved = resolved
      stats.communityScore = reported > 0 ? Math.round((resolved / reported) * 100) : 0
    }

    if (role === 'volunteer') {
      const [reported, resolved] = await Promise.all([
        db.collection('issues').countDocuments({ reporterId: id }),
        db.collection('issues').countDocuments({
          assignedToId: id,
          status: { $in: ['resolved', 'closed'] }
        }),
      ])
      stats.issuesReported = reported
      stats.issuesResolved = resolved
      stats.communityScore = user.rating ? Math.round(user.rating * 20) : 0
    }

    const formattedUser: any = {
      id: user._id.toString(),
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || null,
      avatar: user.avatar || null,
      bio: user.bio || null,
      role,
      isActive: user.isActive !== false,
      createdAt: user.createdAt || null,
      joinDate: user.createdAt || null,
      stats,
    }

    if (role === 'volunteer') {
      formattedUser.skills = user.skills || []
      formattedUser.experienceLevel = user.experienceLevel || ''
      formattedUser.rating = user.rating || 0
      formattedUser.totalTasks = user.totalTasks || 0
      formattedUser.completedTasks = user.completedTasks || 0
      formattedUser.approvalStatus = user.approvalStatus || 'pending'
    }

    return NextResponse.json({
      success: true,
      user: formattedUser,
    })

  } catch (error: any) {
    console.error('GET /api/users/[id] error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user', error: error.message },
      { status: 500 }
    )
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  }
}