// import { NextRequest, NextResponse } from 'next/server'
// import { connectToDatabase } from '@/lib/db'
// import { ObjectId } from 'mongodb'
// import { getCurrentUser } from '@/lib/auth/getCurrentUser'


// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const currentUser = getCurrentUser(req)
//     if (!currentUser) {
//       return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
//     }

//     const { id } = await params

//     if (!ObjectId.isValid(id)) {
//       return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 })
//     }

//     const { db } = await connectToDatabase()

//     let user = null
//     let role = ''

//     user = await db.collection('citizens').findOne(
//       { _id: new ObjectId(id) },
//       { projection: { password: 0 } }
//     )
//     if (user) role = 'citizen'

//     if (!user) {
//       user = await db.collection('volunteers').findOne(
//         { _id: new ObjectId(id) },
//         { projection: { password: 0 } }
//       )
//       if (user) role = 'volunteer'
//     }

//     if (!user) {
//       user = await db.collection('admins').findOne(
//         { _id: new ObjectId(id) },
//         { projection: { password: 0 } }
//       )
//       if (user) role = 'admin'
//     }

//     if (!user) {
//       return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
//     }

//     let stats = {
//       issuesReported: 0,
//       issuesResolved: 0,
//       communityScore: 0,
//     }

//     if (role === 'citizen') {
//       const [reported, resolved] = await Promise.all([
//         db.collection('issues').countDocuments({ reporterId: id }),
//         db.collection('issues').countDocuments({
//           reporterId: id,
//           status: { $in: ['resolved', 'closed'] },
//         }),
//       ])
//       stats.issuesReported = reported
//       stats.issuesResolved = resolved
//       stats.communityScore = reported > 0 ? Math.round((resolved / reported) * 100) : 0
//     }

//     if (role === 'volunteer') {
//       const [reported, resolved] = await Promise.all([
//         db.collection('issues').countDocuments({ reporterId: id }),
//         db.collection('issues').countDocuments({
//           assignedToId: id,
//           status: { $in: ['resolved', 'closed'] },
//         }),
//       ])
//       stats.issuesReported = reported
//       stats.issuesResolved = resolved
//       stats.communityScore = user.rating ? Math.round(user.rating * 20) : 0
//     }

//     const formattedUser: any = {
//       id: user._id.toString(),
//       name: user.name || '',
//       email: user.email || '',
//       phone: user.phone || null,
//       avatar: user.avatar || null,
//       bio: user.bio || null,
//       role,
//       isActive: user.isActive !== false,
//       createdAt: user.createdAt || null,
//       joinDate: user.createdAt || null,
//       stats,
//     }

//     if (role === 'volunteer') {
//       formattedUser.skills = user.skills || []
//       formattedUser.experienceLevel = user.experienceLevel || ''
//       formattedUser.rating = user.rating || 0
//       formattedUser.totalTasks = user.totalTasks || 0
//       formattedUser.completedTasks = user.completedTasks || 0
//       formattedUser.approvalStatus = user.approvalStatus || 'pending'
//     }

//     return NextResponse.json({ success: true, user: formattedUser })
//   } catch (error: any) {
//     console.error('GET /api/users/[id] error:', error)
//     return NextResponse.json(
//       { success: false, message: 'Failed to fetch user', error: error.message },
//       { status: 500 }
//     )
//   }
// }


import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { checkAndAwardAchievements } from '@/lib/services/achievementService'
import { sendEmail } from '@/lib/email'
import { getDeactivationEmail, getActivationEmail } from '@/lib/emails/accountStatusEmail'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = getCurrentUser(req)
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const collections = ['citizens', 'volunteers', 'admins']

    // ✅ Deactivate / Activate
    if (typeof body.isActive === 'boolean') {
      console.log('=== DEACTIVATE CALLED ===')
      // console.log('User email will be:', foundUser?.email)
      console.log('Reason:', body.reason)
      const reason = body.reason?.trim() || ''

      if (body.isActive === false && !reason) {
        return NextResponse.json(
          { success: false, message: 'Please provide a reason for deactivation.' },
          { status: 400 }
        )
      }

      // User fetch karo — name + email chahidi email bhejne vaaste
      let foundUser = null
      let foundCollection = ''
      for (const col of collections) {
        const user = await db.collection(col).findOne({ _id: new ObjectId(id) })
        if (user) { foundUser = user; foundCollection = col; break }
      }

      if (!foundUser) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
      }

      const updateData: any = { isActive: body.isActive, updatedAt: new Date() }

      if (body.isActive === false) {
        updateData.deactivationReason = reason
        updateData.deactivatedAt = new Date()
        updateData.deactivatedBy = adminUser.id
      } else {
        updateData.deactivationReason = null
        updateData.deactivatedAt = null
        updateData.deactivatedBy = null
        updateData.reactivatedAt = new Date()
        updateData.reactivatedBy = adminUser.id
      }

      await db.collection(foundCollection).updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      )

      // Email bhejo — fail hove ta bhi DB update success maano
      try {
        if (body.isActive === false) {
          await sendEmail({
            to: foundUser.email,
            subject: 'Your CivicFix Account Has Been Deactivated',
            html: getDeactivationEmail({
              userName: foundUser.name,
              reason,
              supportEmail: process.env.SUPPORT_EMAIL || 'support@civicfix.com'
            })
          })
        } else {
          await sendEmail({
            to: foundUser.email,
            subject: 'Your CivicFix Account Has Been Reactivated',
            html: getActivationEmail({
              userName: foundUser.name,
              supportEmail: process.env.SUPPORT_EMAIL || 'support@civicfix.com'
            })
          })
        }
      } catch (emailError) {
        console.error('Failed to send account status email:', emailError)
      }

      return NextResponse.json({
        success: true,
        message: body.isActive
          ? 'User account activated successfully'
          : 'User account deactivated successfully'
      })
    }

    // ✅ Role update — existing logic unchanged
    const newRole = body.role

    if (!['citizen', 'volunteer', 'admin'].includes(newRole)) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 })
    }

    let found = false
    for (const col of collections) {
      const result = await db.collection(col).updateOne(
        { _id: new ObjectId(id) },
        { $set: { role: newRole, updatedAt: new Date() } }
      )
      if (result.matchedCount > 0) { found = true; break }
    }

    await db.collection('admins').updateOne(
      { _id: new ObjectId(adminUser.id) },
      { $inc: { 'stats.usersManaged': 1 } }
    )

    const updatedAdmin = await db.collection('admins').findOne(
      { _id: new ObjectId(adminUser.id) },
      { projection: { stats: 1 } }
    )

    await checkAndAwardAchievements(adminUser.id, 'admin', {
      usersManaged: updatedAdmin?.stats?.usersManaged ?? 0,
      level: updatedAdmin?.stats?.level ?? 1,
      points: updatedAdmin?.stats?.points ?? 0,
    })

    if (!found) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Role updated' })

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// DELETE — disabled
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json(
    { success: false, message: 'Hard delete is disabled. Use deactivate instead.' },
    { status: 403 }
  )
}