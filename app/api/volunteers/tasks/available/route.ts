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

// GET /api/volunteers/tasks/available
export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'volunteer' && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only volunteers can view available tasks' },
        { status: 403 }
      )
    }

    const { db } = await connectToDatabase()
    const { searchParams } = new URL(req.url)

    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

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
          ],
        },
      ]
    }

    const skip = (page - 1) * limit
    const total = await db.collection('issues').countDocuments(filter)

    const issues = await db
      .collection('issues')
      .find(filter)
      .sort({ priority: -1, createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const tasks = issues.map((issue) => ({
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
      createdAt: issue.createdAt,
      estimatedTime: issue.estimatedResolutionTime || 'Not specified',
      skillsRequired: issue.tags || [],
      votes: issue.upvotes || 0,
      commentCount: issue.commentsCount || 0,
    }))

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
    console.error('GET /api/volunteers/tasks/available error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch available tasks', error: error.message },
      { status: 500 }
    )
  }
}