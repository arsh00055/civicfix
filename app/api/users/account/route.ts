import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { ObjectId } from 'mongodb'

function getCollection(role: string): string | null {
  if (role === 'citizen') return 'citizens'
  if (role === 'volunteer') return 'volunteers'
  if (role === 'admin') return 'admins'
  return null
}

// DELETE /api/users/account
export async function DELETE(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const collectionName = getCollection(currentUser.role)
    if (!collectionName) {
      return NextResponse.json({ success: false, message: 'Invalid user role' }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Delete user
    await db.collection(collectionName).deleteOne({ _id: new ObjectId(currentUser.id) })

    // Delete user's issues if citizen
    if (currentUser.role === 'citizen') {
      await db.collection('issues').deleteMany({ reporterId: currentUser.id })
    }

    return NextResponse.json({ success: true, message: 'Account deleted successfully' })

  } catch (error: any) {
    console.error('Delete account error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete account' }, { status: 500 })
  }
}
