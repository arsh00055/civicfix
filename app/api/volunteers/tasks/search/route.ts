import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
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

const PRIORITY_SCORE: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'volunteer' && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only volunteers can find tasks' },
        { status: 403 }
      )
    }

    const { db } = await connectToDatabase()
    const { searchParams } = new URL(req.url)

    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const urgency = searchParams.get('urgency')   // low | medium | high (derived from age + priority)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Only show unassigned, open issues
    const filter: any = {
      status: { $in: ['reported', 'in_review'] },
      $or: [{ assignedToId: null }, { assignedToId: { $exists: false } }],
    }

    if (category && category !== 'all') filter.category = category
    if (priority && priority !== 'all') filter.priority = priority

    if (search) {
      filter.$and = [
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
            { tags: { $elemMatch: { $regex: search, $options: 'i' } } },
          ],
        },
      ]
    }

    const skip = (page - 1) * limit
    const total = await db.collection('issues').countDocuments(filter)

    const issues = await db
      .collection('issues')
      .find(filter)
      .sort({ priority: -1, createdAt: 1 }) // critical first, then oldest
      .skip(skip)
      .limit(limit)
      .toArray()

    const now = Date.now()

    const tasks = issues
      .map((issue) => {
        const ageMs = now - new Date(issue.createdAt).getTime()
        const ageDays = ageMs / (1000 * 60 * 60 * 24)
        const priorityScore = PRIORITY_SCORE[issue.priority] || 1

        // Derive urgency from age + priority
        let urgencyLevel: 'low' | 'medium' | 'high' = 'low'
        if (priorityScore >= 3 || ageDays > 14) urgencyLevel = 'high'
        else if (priorityScore === 2 || ageDays > 7) urgencyLevel = 'medium'

        return {
          id: issue._id.toString(),
          title: issue.title,
          description: issue.description,
          category: issue.category,
          priority: issue.priority,
          status: issue.status,
          location: issue.location,
          latitude: issue.latitude,
          longitude: issue.longitude,
          images: issue.images || [],
          tags: issue.tags || [],
          reportedBy: issue.reporter?.name || 'Anonymous',
          reporterId: issue.reporterId,
          createdAt: issue.createdAt,
          reportedAt: issue.reportedAt || issue.createdAt,
          estimatedTime: issue.estimatedResolutionTime || 'Not specified',
          skillsRequired: issue.tags || [],
          votes: issue.upvotes || 0,
          commentCount: issue.commentsCount || 0,
          urgency: urgencyLevel,
          ageDays: Math.floor(ageDays),
        }
      })
      // client asked for urgency filter — apply after derivation
      .filter((task) => {
        if (urgency && urgency !== 'all') return task.urgency === urgency
        return true
      })

    return NextResponse.json({
      success: true,
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('GET /api/volunteers/tasks/find error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tasks', error: error.message },
      { status: 500 }
    )
  }
}