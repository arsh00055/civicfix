import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { checkAndAwardAchievements } from '@/lib/services/achievementService'
import { sendEmail } from '@/lib/email'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const user = getCurrentUser(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { reason } = body

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please provide a reason for deactivation.' },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    let foundUser = null
    let foundCollection = ''
    for (const col of ['citizens', 'volunteers']) {
      const u = await db.collection(col).findOne({ _id: new ObjectId(id) })
      if (u) { foundUser = u; foundCollection = col; break }
    }

    if (!foundUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // foundCollection se role pata lagao
    const userRole = foundCollection === 'citizens' ? 'Citizen' : 'Volunteer'
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@civicfix.com'

    await db.collection(foundCollection).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive: false,
          deactivationReason: reason,
          deactivatedAt: new Date(),
          deactivatedBy: user.id,
          updatedAt: new Date(),
        },
      }
    )

    try{
    await sendEmail({
      to: foundUser.email,
      subject: 'Your CivicFix Account Has Been Deactivated',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
          
          <div style="background: #dc2626; padding: 20px 24px; border-radius: 8px 8px 0 0; margin: -24px -24px 24px -24px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Account Deactivated</h2>
          </div>

          <p>Hi <strong>${foundUser.name}</strong>,</p>

          <p>Your CivicFix <strong>${userRole}</strong> account has been <strong style="color:#dc2626;">deactivated</strong> by our admin team.</p>

          <div style="background:#fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #991b1b; font-weight: 600; text-transform: uppercase;">Reason for Deactivation</p>
            <p style="margin: 0; color: #7f1d1d;">${reason}</p>
          </div>

          <p>While your account is deactivated, you will not be able to log in to CivicFix.</p>

          <div style="background:#f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #14532d; font-weight: 600; text-transform: uppercase;">How to Reactivate</p>
            <p style="margin: 0; color: #166534;">
              Contact our support team at 
              <a href="mailto:${supportEmail}" style="color: #16a34a; font-weight: 600;">${supportEmail}</a>
              with your registered email and reason for appeal. Our team will respond within 2–3 business days.
            </p>
          </div>

          <p style="color:#6b7280; font-size:13px; margin-top: 24px;">— Team CivicFix</p>
        </div>
      `
    })
  }catch (emailErr) {
    console.error('Email send failed (deactivate):', emailErr)
  }

    await db.collection('admins').updateOne(
      { _id: new ObjectId(user.id) },
      { $inc: { 'stats.usersManaged': 1 } }
    )

    const updatedAdmin = await db.collection('admins').findOne(
      { _id: new ObjectId(user.id) },
      { projection: { stats: 1 } }
    )

    await checkAndAwardAchievements(user.id, 'admin', {
      usersManaged: updatedAdmin?.stats?.usersManaged ?? 0,
      level: updatedAdmin?.stats?.level ?? 1,
      points: updatedAdmin?.stats?.points ?? 0,
    })

    return NextResponse.json({
      success: true,
      message: `${foundUser.name} (${userRole}) da account deactivate kar dita gaya.`
    })

  } catch (error: any) {
    console.error('Deactivate user error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}