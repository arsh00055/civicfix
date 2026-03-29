import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function getCurrentUser(req: NextRequest): { id: string; role: string; name: string } | null {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies.get('auth_token')?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { id: decoded.id || decoded.userId, role: decoded.role, name: decoded.name }
  } catch {
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

    const [citizens, volunteers, admins] = await Promise.all([
      db.collection('citizens').find({}).project({ password: 0 }).toArray(),
      db.collection('volunteers').find({}).project({ password: 0 }).toArray(),
      db.collection('admins').find({}).project({ password: 0 }).toArray(),
    ])

    const allUsers = [
      ...citizens.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        email: c.email,
        role: 'citizen',
        avatar: c.avatar || null,
        isActive: c.isActive !== false,
        createdAt: c.createdAt || new Date().toISOString(),
        lastLoginAt: c.lastLoginAt || null,
      })),
      ...volunteers.map((v) => ({
        id: v._id.toString(),
        name: v.name,
        email: v.email,
        role: 'volunteer',
        avatar: v.avatar || null,
        isActive: v.isActive !== false,
        approvalStatus: v.approvalStatus || 'pending',
        skills: v.skills || [],
        createdAt: v.createdAt || new Date().toISOString(),
        lastLoginAt: v.lastLoginAt || null,
      })),
      ...admins.map((a) => ({
        id: a._id.toString(),
        name: a.name,
        email: a.email,
        role: 'admin',
        avatar: a.avatar || null,
        isActive: a.isActive !== false,
        createdAt: a.createdAt || new Date().toISOString(),
        lastLoginAt: a.lastLoginAt || null,
      })),
    ]

    return NextResponse.json(allUsers)
  } catch (error: any) {
    console.error('GET /api/admin/users error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}