import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function getCurrentUser(req: NextRequest): { id: string; role: string } | null {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies.get('auth_token')?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { id: decoded.id || decoded.userId, role: decoded.role }
  } catch {
    return null
  }
}

function getCollection(role: string): string | null {
  if (role === 'citizen') return 'citizens'
  if (role === 'volunteer') return 'volunteers'
  if (role === 'admin') return 'admins'
  return null
}

// GET /api/users/privacy
export async function GET(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const collection = getCollection(currentUser.role)
    if (!collection) return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 })

    const { db } = await connectToDatabase()
    const user = await db.collection(collection).findOne(
      { _id: new ObjectId(currentUser.id) },
      { projection: { privacy: 1 } }
    )

    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    return NextResponse.json({
      success: true,
      privacy: user.privacy || {
        showEmail: false,
        showPhone: false,
        showLocation: true,
        showActivity: true,
        profileVisibility: 'public',
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch privacy settings' }, { status: 500 })
  }
}

// PUT /api/users/privacy
export async function PUT(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const collection = getCollection(currentUser.role)
    if (!collection) return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 })

    const body = await req.json()
    const { showEmail, showPhone, showLocation, showActivity, profileVisibility } = body

    const { db } = await connectToDatabase()

    const privacyData: any = {}
    if (showEmail !== undefined) privacyData['privacy.showEmail'] = showEmail
    if (showPhone !== undefined) privacyData['privacy.showPhone'] = showPhone
    if (showLocation !== undefined) privacyData['privacy.showLocation'] = showLocation
    if (showActivity !== undefined) privacyData['privacy.showActivity'] = showActivity
    if (profileVisibility !== undefined) privacyData['privacy.profileVisibility'] = profileVisibility

    const result = await db.collection(collection).updateOne(
      { _id: new ObjectId(currentUser.id) },
      { $set: { ...privacyData, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Privacy settings updated successfully' })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update privacy settings' }, { status: 500 })
  }
}
