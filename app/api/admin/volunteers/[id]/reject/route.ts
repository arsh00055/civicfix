import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import { sendEmail } from '@/lib/email'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// ✅ SAHI - localStorage token bhi check karo
function getCurrentUser(req: NextRequest): { id: string; role: string; name: string } | null {
    try {
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : req.cookies.get('auth_token')?.value
      
      console.log('🔍 Token received:', token ? token.substring(0, 20) + '...' : 'NULL')
      console.log('🔍 JWT_SECRET:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '...' : 'NOT SET')
      
      if (!token) return null
      const decoded = jwt.verify(token, JWT_SECRET) as any
      console.log('✅ Decoded role:', decoded.role)
      return { id: decoded.id || decoded.userId, role: decoded.role, name: decoded.name }
    } catch (err) {
      console.log('❌ JWT verify failed:', err)
      return null
    }
  }
  export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = getCurrentUser(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

  
    const body = await req.json().catch(() => ({}))
    const { reason } = body

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid volunteer ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const volunteer = await db.collection('volunteers').findOne({ _id: new ObjectId(id) })

    if (!volunteer) {
      return NextResponse.json({ success: false, message: 'Volunteer not found' }, { status: 404 })
    }

    await db.collection('volunteers').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          approvalStatus: 'rejected',
          rejectionReason: reason || 'No reason provided',
          rejectedAt: new Date(),
          isActive: false,
          updatedAt: new Date(),
        },
      }
    )
    // ✅ Rejection email bhejo
await sendEmail({
  to: volunteer.email,
  subject: '😞 Volunteer Application Update — CivicFix',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #dc2626;">Application Status Update</h2>
      <p>Hi <strong>${volunteer.name}</strong>,</p>
      <p>We regret to inform you that your volunteer application has been <strong>rejected</strong>.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p style="color:#6b7280; font-size:13px;">If you have questions, please contact our support team.</p>
      <p style="margin-top:24px; color:#6b7280; font-size:13px;">— Team CivicFix</p>
    </div>
  `
})

    return NextResponse.json({ success: true, message: `${volunteer.name} di application reject kar diti gayi.` })
  } catch (error: any) {
    console.error('Reject volunteer error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}