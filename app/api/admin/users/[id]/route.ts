import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = getCurrentUser(req)
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()
    const newRole = body.role

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 })
    }

    if (!['citizen', 'volunteer', 'admin'].includes(newRole)) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const collections = ['citizens', 'volunteers', 'admins']
    
    let found = false
    for (const col of collections) {
      const result = await db.collection(col).updateOne(
        { _id: new ObjectId(id) },
        { $set: { role: newRole, updatedAt: new Date() } }
      )
      if (result.matchedCount > 0) { found = true; break }
    }

    if (!found) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    return NextResponse.json({ success: true, message: 'Role updated' })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = getCurrentUser(req)
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const collections = ['citizens', 'volunteers', 'admins']
    
    let deleted = false
    for (const col of collections) {
      const result = await db.collection(col).deleteOne({ _id: new ObjectId(id) })
      if (result.deletedCount > 0) { deleted = true; break }
    }

    if (!deleted) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    return NextResponse.json({ success: true, message: 'User deleted' })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}