import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: "Invalid token"
      }, { status: 401 });
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: "Admin access required"
      }, { status: 403 });
    }

    const { db } = await connectToDatabase();
    
    // Get all volunteers with pending approval
    const pendingVolunteers = await db.collection('volunteers')
      .find({ 
        approvalStatus: 'pending',
        isActive: false
      })
      .project({
        password: 0  // Exclude password field
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: pendingVolunteers
    });

  } catch (error) {
    console.error("❌ Error fetching pending volunteers:", error);
    return NextResponse.json({
      success: false,
      message: "Server error. Please try again."
    }, { status: 500 });
  }
}