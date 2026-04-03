import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({
        success: false,
        message: "Token and password are required"
      }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        message: "Password must be at least 8 characters"
      }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Find valid reset token
    const resetRequest = await db.collection('passwordResets').findOne({
      token,
      expiresAt: { $gt: new Date() },
      used: false
    });

    if (!resetRequest) {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired reset token"
      }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine which collection to update based on userType
    let collectionName = '';
    if (resetRequest.userType === 'citizen') {
      collectionName = 'citizens';
    } else if (resetRequest.userType === 'volunteer') {
      collectionName = 'volunteers';
    } else if (resetRequest.userType === 'admin') {
      collectionName = 'admins';
    } else {
      return NextResponse.json({
        success: false,
        message: "Invalid user type"
      }, { status: 400 });
    }
    
    // Update user's password
    const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(resetRequest.userId) },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 });
    }

    // Mark token as used
    await db.collection('passwordResets').updateOne(
      { _id: resetRequest._id },
      { $set: { used: true, usedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    return NextResponse.json({
      success: false,
      message: "Failed to reset password. Please try again."
    }, { status: 500 });
  }
}