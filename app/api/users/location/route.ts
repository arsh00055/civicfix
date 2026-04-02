import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

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

// GET /api/users/location
export async function GET(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const collection = getCollection(currentUser.role)
    if (!collection) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const user = await db.collection(collection).findOne(
      { _id: new ObjectId(currentUser.id) },
      { projection: { address: 1, city: 1, state: 1, zipCode: 1, country: 1, location: 1 } }
    )

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      location: {
        street: user.address || '',
        city: user.city || user.location || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        country: user.country || '',
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch location' }, { status: 500 })
  }
}

// PUT /api/users/location
export async function PUT(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const collection = getCollection(currentUser.role)
    if (!collection) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 })
    }

    const body = await req.json()
    const { street, city, state, zipCode, country } = body

    const { db } = await connectToDatabase()

    const updateData: any = { updatedAt: new Date() }
    if (street !== undefined) updateData.address = street
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (zipCode !== undefined) updateData.zipCode = zipCode
    if (country !== undefined) updateData.country = country

    const result = await db.collection(collection).updateOne(
      { _id: new ObjectId(currentUser.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Location updated successfully' })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update location' }, { status: 500 })
  }
}
