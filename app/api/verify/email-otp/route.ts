import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

function getCollection(role: string) {
  if (role === 'citizen') return 'citizens'
  if (role === 'volunteer') return 'volunteers'
  if (role === 'admin') return 'admins'
  return null
}

// POST /api/verify/email-otp — Confirm email OTP
export async function POST(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { otp } = await req.json()
    if (!otp) return NextResponse.json({ success: false, message: 'OTP is required' }, { status: 400 })

    const { db } = await connectToDatabase()

    const record = await db.collection('verificationOtps').findOne({
      userId: currentUser.id,
      type: 'email',
      used: false,
    })

    if (!record) {
      return NextResponse.json({ success: false, message: 'No OTP found. Please request a new one.' }, { status: 400 })
    }

    if (new Date() > new Date(record.expiresAt)) {
      return NextResponse.json({ success: false, message: 'OTP has expired. Please request a new one.' }, { status: 400 })
    }

    if (record.otp !== otp.trim()) {
      return NextResponse.json({ success: false, message: 'Invalid OTP. Please try again.' }, { status: 400 })
    }

    const collection = getCollection(currentUser.role)
    if (!collection) return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 })

    // Mark email as verified
    await db.collection(collection).updateOne(
      { _id: new ObjectId(currentUser.id) },
      { $set: { 'verification.email': true, updatedAt: new Date() } }
    )

    // Mark OTP as used
    await db.collection('verificationOtps').updateOne(
      { _id: record._id },
      { $set: { used: true } }
    )

    return NextResponse.json({ success: true, message: 'Email verified successfully! ✓' })
  } catch (error: any) {
    console.error('Verify email OTP error:', error)
    return NextResponse.json({ success: false, message: 'Verification failed' }, { status: 500 })
  }
}
