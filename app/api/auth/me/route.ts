import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Not Authenticated',
        user: null
      }, { status: 401 })
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return NextResponse.json({
        success: false,
        message: 'Session expired. Please login again.',
        user: null
      }, { status: 401 })
    }

    const userId = decoded.userId || decoded.id
    const userRole = decoded.role

    // Validate ObjectId
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid user ID',
        user: null
      }, { status: 400 })
    }

    // Find user based on role
    let user = null
    let collection = ''

    if (userRole === 'citizen') {
      user = await db.collection('citizens').findOne({ _id: new ObjectId(userId) })
      collection = 'citizens'
    } else if (userRole === 'volunteer') {
      user = await db.collection('volunteers').findOne({ _id: new ObjectId(userId) })
      collection = 'volunteers'
    } else if (userRole === 'admin') {
      user = await db.collection('admins').findOne({ _id: new ObjectId(userId) })
      collection = 'admins'
    } else {
      // Role not in token, search all collections
      user = await db.collection('citizens').findOne({ _id: new ObjectId(userId) })
      if (user) collection = 'citizens'

      if (!user) {
        user = await db.collection('volunteers').findOne({ _id: new ObjectId(userId) })
        if (user) collection = 'volunteers'
      }

      if (!user) {
        user = await db.collection('admins').findOne({ _id: new ObjectId(userId) })
        if (user) collection = 'admins'
      }
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        user: null
      }, { status: 404 })
    }

    const role = collection === 'citizens' ? 'citizen'
      : collection === 'volunteers' ? 'volunteer'
      : 'admin'

    // Format user data
    const formattedUser: any = {
      id: user._id.toString(),
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      role,
      avatar: user.avatar || null,
      phone: user.phone || null,
      isActive: user.isActive !== false,
      isEmailVerified: user.isEmailVerified || false,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    }

    // Citizen specific fields
    if (role === 'citizen') {
      formattedUser.address = user.address || null
      formattedUser.city = user.city || null
      formattedUser.state = user.state || null
      formattedUser.zipCode = user.zipCode || null
    }

    // Volunteer specific fields
    if (role === 'volunteer') {
      formattedUser.skills = user.skills || []
      formattedUser.availability = user.availability || []
      formattedUser.experienceLevel = user.experienceLevel || ''
      formattedUser.bio = user.bio || null
      formattedUser.approvalStatus = user.approvalStatus || 'pending'
      formattedUser.status = user.status || 'inactive'
      formattedUser.rating = user.rating || 0
      formattedUser.totalTasks = user.totalTasks || 0
      formattedUser.completedTasks = user.completedTasks || 0
    }

    if (role === 'admin') {
      formattedUser.department = user.department || 'Administration'
      formattedUser.permissions = user.permissions || ['all']
      formattedUser.isSuperAdmin = user.isSuperAdmin || false
      // ↓ ithe add karo
      formattedUser.bio = user.bio || null
      formattedUser.city = user.city || null
      formattedUser.phone = user.phone || null
    }
    return NextResponse.json({
      success: true,
      user: formattedUser,
    })

  } catch (error) {
    console.error('Error in /api/auth/me:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch user',
      user: null
    }, { status: 500 })
  }
}