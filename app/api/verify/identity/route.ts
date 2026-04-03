import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

function getCollection(role: string) {
  if (role === 'citizen') return 'citizens'
  if (role === 'volunteer') return 'volunteers'
  if (role === 'admin') return 'admins'
  return null
}

// POST /api/verify/identity — Send identity OTP to verified phone
export async function POST(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const collection = getCollection(currentUser.role)
    if (!collection) return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 })

    const { db } = await connectToDatabase()
    const user = await db.collection(collection).findOne({ _id: new ObjectId(currentUser.id) })
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    if (!user.verification?.phone || !user.phone) {
      return NextResponse.json({
        success: false,
        message: 'Please verify your phone number first before verifying identity.',
      }, { status: 400 })
    }

    if (user.verification?.identity) {
      return NextResponse.json({ success: false, message: 'Identity is already verified' }, { status: 400 })
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await db.collection('verificationOtps').deleteMany({ userId: currentUser.id, type: 'identity' })
    await db.collection('verificationOtps').insertOne({
      userId: currentUser.id,
      type: 'identity',
      phone: user.phone,
      otp,
      expiresAt,
      used: false,
      createdAt: new Date(),
    })

    // In dev just log; in prod use Twilio/SMS
    console.log(`🆔 [DEV] Identity OTP for ${user.phone}: ${otp}`)

    const isDev = process.env.NODE_ENV === 'development'
    return NextResponse.json({
      success: true,
      message: `Identity OTP sent to your verified phone (${user.phone.slice(0, 4)}****${user.phone.slice(-2)})`,
      ...(isDev && { devOtp: otp }),
    })
  } catch (error: any) {
    console.error('Send identity OTP error:', error)
    return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 })
  }
}
