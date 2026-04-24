// import { NextRequest, NextResponse } from 'next/server'
// import { connectToDatabase } from '@/lib/db'
// import { ObjectId } from 'mongodb'

// import { getCurrentUser } from '@/lib/auth/getCurrentUser'
// import { sendEmail } from '@/lib/email'
// import { checkAndAwardAchievements } from '@/lib/services/achievementService'

// export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const { id } = await params
//     const user = getCurrentUser(req)
//     if (!user || user.role !== 'admin') {
//       return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
//     }

  
//     if (!ObjectId.isValid(id)) {
//       return NextResponse.json({ success: false, message: 'Invalid volunteer ID' }, { status: 400 })
//     }

//     const { db } = await connectToDatabase()
//     const volunteer = await db.collection('volunteers').findOne({ _id: new ObjectId(id) })

//     if (!volunteer) {
//       return NextResponse.json({ success: false, message: 'Volunteer not found' }, { status: 404 })
//     }

//     if (volunteer.approvalStatus === 'approved') {
//       return NextResponse.json({ success: false, message: 'Already approved' }, { status: 400 })
//     }

//     await db.collection('volunteers').updateOne(
//       { _id: new ObjectId(id) },
//       {
//         $set: {
//           approvalStatus: 'approved',
//           approvedAt: new Date(),
//           status: 'available',
//           isActive: true,
//           updatedAt: new Date(),
//         },
//         $unset: { rejectionReason: '' },
//       }
//     )

//     await sendEmail({
//       to: volunteer.email,
//       subject: '🎊 Volunteer Application Approved — CivicFix',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
//           <h2 style="color: #16a34a;">✅ Application Approved!</h2>
//           <p>Hi <strong>${volunteer.name}</strong>,</p>
//           <p>Congratulations! Your volunteer application for <strong>CivicFix</strong> has been <strong>approved</strong>.</p>
//           <p>You can now login and start helping your community!</p>
//           <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
//             style="display:inline-block; margin-top:16px; padding:12px 24px; background:#16a34a; color:white; border-radius:8px; text-decoration:none; font-weight:bold;">
//             Login Now →
//           </a>
//           <p style="margin-top:24px; color:#6b7280; font-size:13px;">— Team CivicFix</p>
//         </div>
//       `
//     })

//     await db.collection('admins').updateOne(
//       { _id: new ObjectId(user.id) },
//       { $inc: { 'stats.usersManaged': 1 } }
//     );
    
//     const updatedAdmin = await db.collection('admins').findOne(
//       { _id: new ObjectId(user.id) },
//       { projection: { stats: 1 } }
//     );
    
//     await checkAndAwardAchievements(user.id, 'admin', {
//       usersManaged: updatedAdmin?.stats?.usersManaged ?? 0,
//       level:        updatedAdmin?.stats?.level ?? 1,
//       points:       updatedAdmin?.stats?.points ?? 0,
//     });

//     return NextResponse.json({ success: true, message: `${volunteer.name} has been approved successfully!` })
//   } catch (error: any) {
//     console.error('Approve volunteer error:', error)
//     return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
//   }
// }


import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'

import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { sendEmail } from '@/lib/email'
import { checkAndAwardAchievements } from '@/lib/services/achievementService'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const user = getCurrentUser(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

  
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid volunteer ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const volunteer = await db.collection('volunteers').findOne({ _id: new ObjectId(id) })

    if (!volunteer) {
      return NextResponse.json({ success: false, message: 'Volunteer not found' }, { status: 404 })
    }

    if (volunteer.approvalStatus === 'approved') {
      return NextResponse.json({ success: false, message: 'Already approved' }, { status: 400 })
    }

    await db.collection('volunteers').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          approvalStatus: 'approved',
          approvedAt: new Date(),
          status: 'available',
          isActive: true,
          updatedAt: new Date(),
        },
        $unset: { rejectionReason: '' },
      }
    )

    // ✅ FIX: Email failure should NOT block the approval
    try {
      await sendEmail({
        to: volunteer.email,
        subject: '🎊 Volunteer Application Approved — CivicFix',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #16a34a;">✅ Application Approved!</h2>
            <p>Hi <strong>${volunteer.name}</strong>,</p>
            <p>Congratulations! Your volunteer application for <strong>CivicFix</strong> has been <strong>approved</strong>.</p>
            <p>You can now login and start helping your community!</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
              style="display:inline-block; margin-top:16px; padding:12px 24px; background:#16a34a; color:white; border-radius:8px; text-decoration:none; font-weight:bold;">
              Login Now →
            </a>
            <p style="margin-top:24px; color:#6b7280; font-size:13px;">— Team CivicFix</p>
          </div>
        `
      })
    } catch (emailError) {
      // Email fail hone se approval rok nahi sakde — sirf log kar do
      console.error('Approval email failed (non-critical):', emailError)
    }

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

    return NextResponse.json({ success: true, message: `${volunteer.name} has been approved successfully!` })
  } catch (error: any) {
    console.error('Approve volunteer error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}