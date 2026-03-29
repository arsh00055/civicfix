import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// ✅ SAHI - localStorage token bhi check karo
function getCurrentUser(req: NextRequest): { id: string; role: string; name: string } | null {
    try {
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : req.cookies.get('auth_token')?.value
      
      console.log('🔍 Token received:', token ? token.substring(0, 20) + '...' : 'NULL')
      console.log('🔍 JWT_SECRET:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '...' : 'NOT SET')
      
      if (!token) return null
      const decoded = jwt.verify(token, JWT_SECRET) as any
      console.log('✅ Decoded role:', decoded.role)
      return { id: decoded.id || decoded.userId, role: decoded.role, name: decoded.name }
    } catch (err) {
      console.log('❌ JWT verify failed:', err)
      return null
    }
  }
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