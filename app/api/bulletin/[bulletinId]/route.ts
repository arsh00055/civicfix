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
    return { id: decoded.id || decoded.userId, role: decoded.role, name: decoded.name }
  } catch { return null }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ bulletinId: string }> }
) {
  try {
    const user = getCurrentUser(req)
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { bulletinId } = await params
    const id =bulletinId;
    if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const { db } = await connectToDatabase()
    const post = await db.collection('bulletin').findOne({ _id: new ObjectId(id) })

    if (!post) return NextResponse.json({ message: 'Post not found' }, { status: 404 })
    if (post.author.id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorised to delete this post' }, { status: 403 })
    }

    await db.collection('bulletin').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isRemoved: true, updatedAt: new Date().toISOString() } }
    )

    return NextResponse.json({ success: true, message: 'Post removed' })
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to delete post', error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ bullletinId: string }> }
) {
  try {
    const user = getCurrentUser(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Admin only' }, { status: 403 })
    }

    const { bullletinId } = await params
    const id = bullletinId;
    if (!ObjectId.isValid(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })

    const { isPinned } = await req.json()
    const { db } = await connectToDatabase()

    await db.collection('bulletin').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isPinned: !!isPinned, updatedAt: new Date().toISOString() } }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to update post', error: error.message }, { status: 500 })
  }
}