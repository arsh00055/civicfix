<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();

    // ================= GET TOKEN FROM COOKIE =================
    let token = request.cookies.get('token')?.value;
    let userId = null;
    let userRole = null;

    // If no token in cookie, check Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // If still no token, user not authenticated
    if (!token) {
      return NextResponse.json({
        success: false,
        message: "Not Authenticated",
        user: null
      }, { status: 401 });
    }

    // ================= VERIFY JWT TOKEN =================
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      userId = decoded.userId;
      userRole = decoded.role;
    } catch (err) {
      console.error('Invalid or expired token:', err);
      return NextResponse.json({
        success: false,
        message: "Session expired. Please login again.",
        user: null
      }, { status: 401 });
    }

    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json({
        success: false,
        message: "Invalid user ID",
        user: null
      }, { status: 401 });
    }

    // Validate ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
    if (!isValidObjectId) {
      return NextResponse.json({
        success: false,
        message: "Invalid user ID format",
        user: null
      }, { status: 400 });
    }

    // ================= FIND USER BASED ON ROLE =================
    let user = null;
    let collectionName = '';

    // Determine which collection to query based on role from token
    if (userRole === 'citizen') {
      collectionName = 'citizens';
    } else if (userRole === 'volunteer') {
      collectionName = 'volunteers';
    } else if (userRole === 'admin') {
      collectionName = 'admins';
    } else {
      // If role not in token, search all collections
      user = await db.collection('citizens').findOne({ _id: new ObjectId(userId) });
      if (user) {
        collectionName = 'citizens';
        userRole = 'citizen';
      }
      
      if (!user) {
        user = await db.collection('volunteers').findOne({ _id: new ObjectId(userId) });
        if (user) {
          collectionName = 'volunteers';
          userRole = 'volunteer';
        }
      }
      
      if (!user) {
        user = await db.collection('admins').findOne({ _id: new ObjectId(userId) });
        if (user) {
          collectionName = 'admins';
          userRole = 'admin';
        }
      }
    }

    // If role is known, query specific collection
    if (!user && collectionName) {
      user = await db.collection(collectionName).findOne({ _id: new ObjectId(userId) });
    }

    // If user not found
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
        user: null
      }, { status: 404 });
    }

    // ================= FORMAT USER DATA =================
    const formattedUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: userRole,
      avatar: user.avatar || null,
      phone: user.phone || null,
      isActive: user.isActive || false,
      isEmailVerified: user.isEmailVerified || false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      
      // Citizen specific fields
      ...(userRole === 'citizen' && {
        address: user.address,
        city: user.city,
        zipCode: user.zipCode
      }),
      
      // Volunteer specific fields
      ...(userRole === 'volunteer' && {
        skills: user.skills || [],
        availability: user.availability || [],
        experienceLevel: user.experienceLevel,
        bio: user.bio || null,
        approvalStatus: user.approvalStatus || 'pending',
        status: user.status || 'available',
        rating: user.rating || 0,
        totalTasks: user.totalTasks || 0,
        completedTasks: user.completedTasks || 0
      }),
      
      // Admin specific fields
      ...(userRole === 'admin' && {
        department: user.department,
        permissions: user.permissions || [],
        isSuperAdmin: user.isSuperAdmin || false
      })
    };

    return NextResponse.json({
      success: true,
      user: formattedUser
    });

  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch user",
      user: null
    }, { status: 500 });
=======
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Token — Authorization header ya cookie se
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

    // JWT verify karo
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

    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid user ID',
        user: null
      }, { status: 400 })
    }

    // Role ke hisaab se collection dhundo
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
      // Role nahi pata — teeno check karo
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

=======
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Token — Authorization header ya cookie se
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

    // JWT verify karo
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

    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid user ID',
        user: null
      }, { status: 400 })
    }

    // Role ke hisaab se collection dhundo
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
      // Role nahi pata — teeno check karo
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

>>>>>>> Stashed changes
    // Common fields
    const formattedUser: any = {
      id: user._id.toString(),
      email: user.email || '',
      name: user.name || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role,
      avatar: user.avatar || null,
      phone: user.phone || null,
      isActive: user.isActive !== false,
      isEmailVerified: user.isEmailVerified || false,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    }

    // Citizen specific
    if (role === 'citizen') {
      formattedUser.address = user.address || null
      formattedUser.city = user.city || null
      formattedUser.state = user.state || null
      formattedUser.zipCode = user.zipCode || null
    }

    // Volunteer specific
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

    // Admin specific
    if (role === 'admin') {
      formattedUser.department = user.department || 'Administration'
      formattedUser.permissions = user.permissions || ['all']
      formattedUser.isSuperAdmin = user.isSuperAdmin || false
    }

    return NextResponse.json({
      success: true,
      user: formattedUser,
      // Compatibility — kuch jagah direct user fields expect karde ne
      ...formattedUser,
    })

  } catch (error) {
    console.error('Error in /api/auth/me:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch user',
      user: null
    }, { status: 500 })
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  }
}