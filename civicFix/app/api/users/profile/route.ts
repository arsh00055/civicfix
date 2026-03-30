<<<<<<< Updated upstream
<<<<<<< Updated upstream
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

// Role ke hisaab se collection
function getCollection(role: string) {
  if (role === 'citizen') return 'citizens'
  if (role === 'volunteer') return 'volunteers'
  if (role === 'admin') return 'admins'
  return null
}

// ============ GET /api/users/profile ============
export async function GET(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const collection = getCollection(currentUser.role)

    if (!collection) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 })
    }

    const user = await db.collection(collection).findOne(
      { _id: new ObjectId(currentUser.id) },
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Stats fetch karo — issues collection toh
    let stats = {
      issuesReported: 0,
      issuesResolved: 0,
      communityScore: 0,
    }

    if (currentUser.role === 'citizen') {
      const [reported, resolved] = await Promise.all([
        db.collection('issues').countDocuments({ reporterId: currentUser.id }),
        db.collection('issues').countDocuments({
          reporterId: currentUser.id,
          status: { $in: ['resolved', 'closed'] }
        }),
      ])
      stats.issuesReported = reported
      stats.issuesResolved = resolved
      stats.communityScore = reported > 0 ? Math.round((resolved / reported) * 100) : 0
    }

    if (currentUser.role === 'volunteer') {
      const [reported, resolved] = await Promise.all([
        db.collection('issues').countDocuments({ reporterId: currentUser.id }),
        db.collection('issues').countDocuments({
          assignedToId: currentUser.id,
          status: { $in: ['resolved', 'closed'] }
        }),
      ])
      stats.issuesReported = reported
      stats.issuesResolved = resolved
      stats.communityScore = user.rating ? Math.round(user.rating * 20) : 0
    }

    // Common fields
    const formattedUser: any = {
      id: user._id.toString(),
      name: user.name || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || null,
      avatar: user.avatar || null,
      bio: user.bio || null,
      role: currentUser.role,
      isActive: user.isActive !== false,
      isEmailVerified: user.isEmailVerified || false,
      createdAt: user.createdAt || null,
      updatedAt: user.updatedAt || null,
      joinDate: user.createdAt || null,
      stats,
    }

    // Citizen specific
    if (currentUser.role === 'citizen') {
      formattedUser.address = {
        street: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        country: user.country || '',
      }
    }

    // Volunteer specific
    if (currentUser.role === 'volunteer') {
      formattedUser.skills = user.skills || []
      formattedUser.availability = user.availability || []
      formattedUser.experienceLevel = user.experienceLevel || ''
      formattedUser.approvalStatus = user.approvalStatus || 'pending'
      formattedUser.rating = user.rating || 0
      formattedUser.totalTasks = user.totalTasks || 0
      formattedUser.completedTasks = user.completedTasks || 0
      formattedUser.address = {
        street: '',
        city: user.location || '',
        state: '',
        zipCode: '',
        country: '',
      }
    }

    // Admin specific
    if (currentUser.role === 'admin') {
      formattedUser.department = user.department || 'Administration'
      formattedUser.permissions = user.permissions || ['all']
      formattedUser.isSuperAdmin = user.isSuperAdmin || false
    }

    return NextResponse.json({
      success: true,
      user: formattedUser,
      // Backward compatibility
      ...formattedUser,
    })

  } catch (error: any) {
    console.error('GET /api/users/profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile', error: error.message },
      { status: 500 }
    )
  }
}

// ============ PUT /api/users/profile ============
export async function PUT(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { db } = await connectToDatabase()
    const collection = getCollection(currentUser.role)

    if (!collection) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 })
    }

    // Common fields jo update ho sakte ne
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.bio !== undefined) updateData.bio = body.bio
    if (body.avatar !== undefined) updateData.avatar = body.avatar

    // Citizen specific updates
    if (currentUser.role === 'citizen') {
      if (body.address?.street !== undefined) updateData.address = body.address.street
      if (body.address?.city !== undefined) updateData.city = body.address.city
      if (body.address?.state !== undefined) updateData.state = body.address.state
      if (body.address?.zipCode !== undefined) updateData.zipCode = body.address.zipCode
      if (body.address?.country !== undefined) updateData.country = body.address.country
    }

    // Volunteer specific updates
    if (currentUser.role === 'volunteer') {
      if (body.skills !== undefined) updateData.skills = body.skills
      if (body.availability !== undefined) updateData.availability = body.availability
      if (body.experienceLevel !== undefined) updateData.experienceLevel = body.experienceLevel
    }

    const result = await db.collection(collection).updateOne(
      { _id: new ObjectId(currentUser.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Updated user fetch karo
    const updatedUser = await db.collection(collection).findOne(
      { _id: new ObjectId(currentUser.id) },
      { projection: { password: 0 } }
    )

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      user: { ...updatedUser, id: updatedUser?._id.toString() },
    })

  } catch (error: any) {
    console.error('PUT /api/users/profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update profile', error: error.message },
      { status: 500 }
    )
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  }
}