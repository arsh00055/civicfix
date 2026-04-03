import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { checkAndAwardAchievements } from '@/lib/services/achievementService'
import { sendEmail } from '@/lib/email'
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

    await db.collection('admins').updateOne(
      { _id: new ObjectId(user.id) },
      { $inc: { 'stats.usersManaged': 1 } }
    );
    
    const updatedAdmin = await db.collection('admins').findOne(
      { _id: new ObjectId(user.id) },
      { projection: { stats: 1 } }
    );
    
    await checkAndAwardAchievements(user.id, 'admin', {
      usersManaged: updatedAdmin?.stats?.usersManaged ?? 0,
      level:        updatedAdmin?.stats?.level ?? 1,
      points:       updatedAdmin?.stats?.points ?? 0,
    });

    return NextResponse.json({ success: true, message: `${volunteer.name} di application reject kar diti gayi.` })
  } catch (error: any) {
    console.error('Reject volunteer error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}