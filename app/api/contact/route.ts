
// import { connectToDatabase } from '@/lib/db'
// import { NextRequest, NextResponse } from 'next/server'
// import { sendEmail } from '@/lib/email'

// export async function POST(req: NextRequest) {
//   try {
//     const { name, email, subject, message } = await req.json()

//     if (!name || !email || !message) {
//       return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 })
//     }

//        // DB vich save karo
//        const { db } = await connectToDatabase()
//        await db.collection('contacts').insertOne({
//          name,
//          email,
//          subject,
//          message,
//          status: 'open',
//          createdAt: new Date(),
//        })
//     // Send email to support
//     try{
//     await sendEmail({
//       to: process.env.GMAIL_USER || '',
//       subject: `[CivicFix Support] ${subject} - from ${name}`,
//       html: `
//         <h2>New Support Request</h2>
//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Subject:</strong> ${subject}</p>
//         <p><strong>Message:</strong></p>
//         <p>${message}</p>
//       `
//     })
//   }catch (emailError) {
//     // Email fail hone se approval rok nahi sakde — sirf log kar do
//     console.error('rejection email failed (non-critical):', emailError)
//   }

//     // Send confirmation to user
//     try{
//     await sendEmail({
//       to: email,
//       subject: 'We received your message — CivicFix Support',
//       html: `
//         <h2>Hi ${name},</h2>
//         <p>Thank you for contacting CivicFix Support. We have received your message and will get back to you within 24 hours.</p>
//         <p><strong>Your message:</strong></p>
//         <p>${message}</p>
//         <br/>
//         <p>Best regards,<br/>CivicFix Support Team</p>
//       `
//     })
//   }catch (emailError) {
//     // Email fail hone se approval rok nahi sakde — sirf log kar do
//     console.error('rejection email failed (non-critical):', emailError)
//   }

//     return NextResponse.json({ success: true, message: 'Message sent successfully' })
//   } catch (error: any) {
//     console.error('Contact form error:', error)
//     return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 })
//   }
// }



import { connectToDatabase } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export async function POST(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req) 
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 })
    }

    // DB vich save karo
    const { db } = await connectToDatabase()
    await db.collection('contacts').insertOne({
      name,
      email,
      subject,
      message,
      status: 'open',
      role: currentUser?.role || 'citizen',
      createdAt: new Date(),
    })

    // Admin nu email
    try {
      await sendEmail({
        to: process.env.GMAIL_USER || '',
        subject: `[CivicFix Support] ${subject} - from ${name}`,
        html: `
          <h2>New Support Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      })
    } catch (emailError) {
      console.error('Admin email failed (non-critical):', emailError)
    }

    // User nu confirmation
    try {
      await sendEmail({
        to: email,
        subject: 'We received your message — CivicFix Support',
        html: `
          <h2>Hi ${name},</h2>
          <p>Thank you for contacting CivicFix Support. We have received your message and will get back to you within 24 hours.</p>
          <p><strong>Your message:</strong></p>
          <p>${message}</p>
          <br/>
          <p>Best regards,<br/>CivicFix Support Team</p>
        `
      })
    } catch (emailError) {
      console.error('User confirmation email failed (non-critical):', emailError)
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully' })
  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 })
  }
}