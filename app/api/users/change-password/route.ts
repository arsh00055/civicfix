import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import bcrypt from 'bcryptjs'

function getCollection(role: string): string | null {
  if (role === 'citizen') return 'citizens'
  if (role === 'volunteer') return 'volunteers'
  if (role === 'admin') return 'admins'
  return null
}

// PUT /api/users/change-password
export async function PUT(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, message: 'New password must be at least 8 characters' }, { status: 400 })
    }

    const collectionName = getCollection(currentUser.role)
    if (!collectionName) {
      return NextResponse.json({ success: false, message: 'Invalid user role' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const collection = db.collection(collectionName)

    // Find user
    const { ObjectId } = await import('mongodb')
    const user = await collection.findOne({ _id: new ObjectId(currentUser.id) })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await collection.updateOne(
      { _id: new ObjectId(currentUser.id) },
      { $set: { password: hashedPassword, updatedAt: new Date().toISOString() } }
    )

    return NextResponse.json({ success: true, message: 'Password changed successfully' })

  } catch (error: any) {
    console.error('Change password error:', error)
    return NextResponse.json({ success: false, message: 'Failed to change password' }, { status: 500 })
  }
}
