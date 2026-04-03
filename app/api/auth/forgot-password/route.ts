import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest){
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({
                success: false,
                message: "Email is required"
            }, { status: 400});
        }

        const { db } = await connectToDatabase();

        const citizen = await db.collection('citizens').findOne({ email });
        const volunteer = await db.collection('volunteers').findOne({ email });
        const admin = await db.collection('admins').findOne({ email });

        const user = citizen || volunteer || admin;
        let userType = '';

        if (citizen) userType = 'citizen';
    else if (volunteer) userType = 'volunteer';
    else if (admin) userType = 'admin';


    if (!user) {
        return NextResponse.json({
          success: true,
          message: "If an account exists with this email, you will receive a reset link."
        });
      }

      // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store token in database
    await db.collection('passwordResets').insertOne({
        userId: user._id.toString(),
        userType,
        email,
        token: resetToken,
        expiresAt: resetTokenExpiry,
        used: false,
        createdAt: new Date()
      });

       // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    await sendEmail({
        to: email,
        subject: "Reset Your Password",
        html: `
          <h1>Reset Your Password</h1>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });

      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a reset link."
      });

    } catch (error) {
        console.error('❌ Forgot password error:', error);
        return NextResponse.json({
          success: false,
          message: "Failed to process request. Please try again."
        }, { status: 500 });
    }
}