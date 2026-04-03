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

async function verifyOTP(phone: string, otp: string): Promise<boolean> {
  const twilio = require('twilio')
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

  const result = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
    .verificationChecks.create({
      to: phone,
      code: otp
    })

  return result.status === 'approved'
}

// POST /api/verify/phone-otp — Confirm phone OTP
export async function POST(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { otp, phone } = await req.json()

    if (!otp) return NextResponse.json({ success: false, message: 'OTP is required' }, { status: 400 })
    if (!phone) return NextResponse.json({ success: false, message: 'Phone is required' }, { status: 400 })

    // Auto add +91 if no country code
    const formattedPhone = phone.startsWith('+') ? phone : '+91' + phone

    // Twilio Verify ਨਾਲ OTP check ਕਰੋ
    const isValid = await verifyOTP(formattedPhone, otp.trim())

    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Invalid OTP. Please try again.' }, { status: 400 })
    }

    const collection = getCollection(currentUser.role)
    if (!collection) return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 })

    const { db } = await connectToDatabase()

    // Mark phone as verified
    await db.collection(collection).updateOne(
      { _id: new ObjectId(currentUser.id) },
      {
        $set: {
          phone: formattedPhone,
          'verification.phone': true,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ success: true, message: 'Phone verified successfully! ✓' })
  } catch (error: any) {
    console.error('Verify phone OTP error:', error)
    return NextResponse.json({ success: false, message: 'Verification failed' }, { status: 500 })
  }
}