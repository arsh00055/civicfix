import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function getCurrentUser(req: NextRequest): { id: string; role: string; email: string } | null {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies.get('auth_token')?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { id: decoded.id || decoded.userId, role: decoded.role, email: decoded.email }
  } catch {
    return null
  }
}

function getCollection(role: string) {
  if (role === 'citizen') return 'citizens'
  if (role === 'volunteer') return 'volunteers'
  if (role === 'admin') return 'admins'
  return null
}

// POST /api/verify/email — Send OTP to email
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

    if (user.isEmailVerified) {
      return NextResponse.json({ success: false, message: 'Email is already verified' }, { status: 400 })
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save OTP in DB
    await db.collection('verificationOtps').deleteMany({ userId: currentUser.id, type: 'email' })
    await db.collection('verificationOtps').insertOne({
      userId: currentUser.id,
      type: 'email',
      otp,
      expiresAt,
      used: false,
      createdAt: new Date(),
    })

    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email — CivicFix',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #1d4ed8; margin-bottom: 8px;">📧 Email Verification</h2>
          <p style="color: #374151;">Hi <strong>${user.name || user.firstName || 'there'}</strong>,</p>
          <p style="color: #374151;">Use the OTP below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
          <div style="background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #1d4ed8;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 13px;">If you did not request this, please ignore this email.</p>
          <p style="color: #6b7280; font-size: 13px;">— Team CivicFix</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: 'OTP sent to your email address' })
  } catch (error: any) {
    console.error('Send email OTP error:', error)
    return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 })
  }
}
