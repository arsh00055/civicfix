import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // volunteers collection — approvalStatus: 'pending'
    const pendingVolunteers = await db
      .collection('volunteers')
      .find({ approvalStatus: 'pending' })
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .toArray()

    const normalized = pendingVolunteers.map((v) => ({
      _id: v._id.toString(),
      name: v.name,
      email: v.email,
      skills: v.skills || [],
      experienceLevel: v.experienceLevel || '',
      phone: v.phone || null,
      bio: v.bio || null,
      avatar: v.avatar || null,
      location: v.location || null,
      createdAt: v.createdAt || new Date().toISOString(),
    }))

    return NextResponse.json({ success: true, data: normalized, count: normalized.length })
  } catch (error: any) {
    console.error('GET /api/admin/volunteers/pending error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}