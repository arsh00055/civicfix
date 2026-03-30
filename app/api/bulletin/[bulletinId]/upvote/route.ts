// app/api/bulletin/[id]/upvote/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function getCurrentUser(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies.get('auth_token')?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { id: decoded.id || decoded.userId, role: decoded.role }
  } catch { return null }
}

// POST /api/bulletin/[id]/upvote — toggle upvote
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bulletinId: string }> }
) {
  try {
    const user = getCurrentUser(req)
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { bulletinId } = await params;
    const id = bulletinId;
    if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const { db } = await connectToDatabase()
    const post = await db.collection('bulletin').findOne({ _id: new ObjectId(id) })

    if (!post) return NextResponse.json({ message: 'Post not found' }, { status: 404 })

    const hasUpvoted = post.upvoters?.includes(user.id)
    const now = new Date().toISOString()

    if (hasUpvoted) {
      await db.collection('bulletin').updateOne(
        { _id: new ObjectId(id) },
        {
          $pull: { upvoters: user.id } as any,
          $inc: { upvotes: -1 },
          $set: { updatedAt: now },
        }
      )
    } else {
      await db.collection('bulletin').updateOne(
        { _id: new ObjectId(id) },
        {
          $push: { upvoters: user.id } as any,
          $inc: { upvotes: 1 },
          $set: { updatedAt: now },
        }
      )
    }

    const updated = await db.collection('bulletin').findOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      success: true,
      upvotes: updated?.upvotes || 0,
      hasUpvoted: !hasUpvoted,
    })
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to upvote', error: error.message }, { status: 500 })
  }
}