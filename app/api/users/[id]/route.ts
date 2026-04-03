import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    let user = null
    let role = ''

    user = await db.collection('citizens').findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    )
    if (user) role = 'citizen'

    if (!user) {
      user = await db.collection('volunteers').findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
      )
      if (user) role = 'volunteer'
    }

    if (!user) {
      user = await db.collection('admins').findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
      )
      if (user) role = 'admin'
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

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
          status: { $in: ['resolved', 'closed'] },
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
          status: { $in: ['resolved', 'closed'] },
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

    return NextResponse.json({ success: true, user: formattedUser })
  } catch (error: any) {
    console.error('GET /api/users/[id] error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user', error: error.message },
      { status: 500 }
    )
  }
}