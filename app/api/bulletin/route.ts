import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

// GET /api/bulletin
export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req)
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { db } = await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || ''
    const page     = parseInt(searchParams.get('page') || '1')
    const limit    = parseInt(searchParams.get('limit') || '15')

    const filter: any = { isRemoved: { $ne: true } }
    if (category && category !== 'all') filter.category = category

    const skip  = (page - 1) * limit
    const total = await db.collection('bulletin').countDocuments(filter)
    const posts = await db.collection('bulletin')
      .find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const formatted = posts.map(post => ({
      id:         post._id.toString(),
      title:      post.title,
      body:       post.body,
      category:   post.category,
      isPinned:   post.isPinned || false,
      upvotes:    post.upvotes || 0,
      hasUpvoted: post.upvoters?.includes(user.id) || false,
      commentCount: post.commentCount || 0,
      author:     post.author,
      createdAt:  post.createdAt,
      updatedAt:  post.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      posts: formatted,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch posts', error: error.message }, { status: 500 })
  }
}

// POST /api/bulletin
export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser(req)
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { title, body, category = 'general' } = await req.json()

    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ message: 'Title and body are required' }, { status: 400 })
    }

    const VALID_CATEGORIES = ['general', 'announcement', 'help_wanted', 'celebration', 'discussion']
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ message: 'Invalid category' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const now = new Date().toISOString()

    const post = {
      title:    title.trim(),
      body:     body.trim(),
      category,
      isPinned: false,
      upvotes:  0,
      upvoters: [],
      commentCount: 0,
      comments: [],
      isRemoved: false,
      author: { id: user.id, name: user.name, role: user.role },
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection('bulletin').insertOne(post)

    return NextResponse.json({
      success: true,
      post: { ...post, id: result.insertedId.toString() },
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create post', error: error.message }, { status: 500 })
  }
}