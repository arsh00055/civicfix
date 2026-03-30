import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ 
        valid: false, 
        message: "Token is required" 
      }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Find valid reset token
    const resetRequest = await db.collection('passwordResets').findOne({
      token,
      expiresAt: { $gt: new Date() },
      used: false
    });

    // If token is valid, return user info (optional)
    if (resetRequest) {
      return NextResponse.json({
        valid: true,
        email: resetRequest.email,
        userType: resetRequest.userType
      });
    }

    return NextResponse.json({
      valid: false,
      message: "Invalid or expired reset token"
    });

  } catch (error) {
    console.error('❌ Validate token error:', error);
    return NextResponse.json({ 
      valid: false, 
      message: "Failed to validate token" 
    }, { status: 500 });
  }
}