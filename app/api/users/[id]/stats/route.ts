import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function getCurrentUser(req: NextRequest): { id: string; role: string } | null {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies.get('auth_token')?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { id: decoded.id || decoded.userId, role: decoded.role }
  } catch {
    return null
  }
}

// GET /api/users/[id]/stats
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

    // Find user across collections
    let user = null
    let role = ''

    user = await db.collection('citizens').findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } })
    if (user) role = 'citizen'

    if (!user) {
      user = await db.collection('volunteers').findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } })
      if (user) role = 'volunteer'
    }

    if (!user) {
      user = await db.collection('admins').findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } })
      if (user) role = 'admin'
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Calculate days active
    const joinDate = user.createdAt ? new Date(user.createdAt) : new Date()
    const daysActive = Math.floor((Date.now() - joinDate.getTime()) / 86400000)

    // Issue stats
    const [issuesReported, issuesResolved, issuesInProgress] = await Promise.all([
      db.collection('issues').countDocuments({ reporterId: id }),
      db.collection('issues').countDocuments({ reporterId: id, status: { $in: ['resolved', 'closed'] } }),
      db.collection('issues').countDocuments({ reporterId: id, status: { $in: ['in_progress', 'assigned'] } }),
    ])

    // Engagement stats
    const [totalVotes, totalComments] = await Promise.all([
      db.collection('issues').countDocuments({ 'votes.userId': id }),
      db.collection('comments').countDocuments({ userId: id }).catch(() => 0),
    ])

    // Achievement stats
    const achievementsUnlocked = await db.collection('userAchievements')
      .countDocuments({ userId: id, unlockedAt: { $exists: true } })
      .catch(() => 0)

    const communityScore = issuesReported > 0 ? Math.round((issuesResolved / issuesReported) * 100) : 0

    const stats: any = {
      issuesReported,
      issuesResolved,
      issuesInProgress,
      communityScore,
      totalVotes,
      totalComments,
      achievementsUnlocked,
      joinDate: user.createdAt || null,
      daysActive,
    }

    // Volunteer specific
    if (role === 'volunteer') {
      stats.tasksCompleted = user.completedTasks || 0
      stats.tasksAssigned = user.totalTasks || 0
      stats.rating = user.rating || 0
      stats.totalRatings = user.totalRatings || 0
    }

    return NextResponse.json({ success: true, stats, role })
  } catch (error: any) {
    console.error('GET /api/users/[id]/stats error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch stats' }, { status: 500 })
  }
}
