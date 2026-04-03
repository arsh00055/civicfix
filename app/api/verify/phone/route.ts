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

async function sendSMS(phone: string) {
  const twilio = require('twilio')
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
    .verifications.create({
      to: phone,
      channel: 'sms'
    })
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    let phone = body.phone?.trim()

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 })
    }

    if (!phone.startsWith('+')) {
      phone = '+91' + phone
    }

    const collection = getCollection(currentUser.role)
    if (!collection) return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 })

    const { db } = await connectToDatabase()
    const user = await db.collection(collection).findOne({ _id: new ObjectId(currentUser.id) })
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })

    if (user.verification?.phone) {
      return NextResponse.json({ success: false, message: 'Phone is already verified' }, { status: 400 })
    }

    await sendSMS(phone)

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your phone number',
      phone,
    })
  } catch (error: any) {
    console.error('Send phone OTP error:', error)
    return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 })
  }
}