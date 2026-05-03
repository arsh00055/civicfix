import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

// GET — saare messages lao
export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const contacts = await db.collection('contacts')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ success: true, data: contacts })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

// PATCH — status update karo (open/resolved)
export async function PATCH(req: NextRequest) {
  try {
    const user = getCurrentUser(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id, status } = await req.json()
    const { db } = await connectToDatabase()
    const { ObjectId } = require('mongodb')

    await db.collection('contacts').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    )

    return NextResponse.json({ success: true, message: 'Status updated' })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}