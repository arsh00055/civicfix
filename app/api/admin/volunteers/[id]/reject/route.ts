import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await req.json().catch(() => ({}))
    const { reason } = body

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid volunteer ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const volunteer = await db.collection('volunteers').findOne({ _id: new ObjectId(id) })

    if (!volunteer) {
      return NextResponse.json({ success: false, message: 'Volunteer not found' }, { status: 404 })
    }

    await db.collection('volunteers').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          approvalStatus: 'rejected',
          rejectionReason: reason || 'No reason provided',
          rejectedAt: new Date(),
          isActive: false,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ success: true, message: `${volunteer.name} di application reject kar diti gayi.` })
  } catch (error: any) {
    console.error('Reject volunteer error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}