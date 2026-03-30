import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const volunteerId = params.id;
    
    // Validate ObjectId
    if (!ObjectId.isValid(volunteerId)) {
      return NextResponse.json({
        success: false,
        message: "Invalid volunteer ID"
      }, { status: 400 });
    }

    // Check if volunteer exists
    const volunteer = await db.collection('volunteers').findOne({
      _id: new ObjectId(volunteerId)
    });

    if (!volunteer) {
      return NextResponse.json({
        success: false,
        message: "Volunteer not found"
      }, { status: 404 });
    }

    // Check if already approved
    if (volunteer.approvalStatus === 'approved') {
      return NextResponse.json({
        success: false,
        message: "Volunteer already approved"
      }, { status: 400 });
    }

    // Update volunteer status to approved
    const result = await db.collection('volunteers').updateOne(
      { _id: new ObjectId(volunteerId) },
      {
        $set: {
          approvalStatus: 'approved',
          isActive: true,
          status: 'available',
          approvedBy: decoded.userId,
          approvedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "Volunteer not found"
      }, { status: 404 });
    }

    console.log(`✅ Volunteer ${volunteerId} approved by admin ${decoded.userId}`);

    // TODO: Send email notification to volunteer
    // You can implement email service here

    return NextResponse.json({
      success: true,
      message: "Volunteer approved successfully",
      data: {
        volunteerId: volunteerId,
        status: 'approved'
      }
    });

  } catch (error) {
    console.error("❌ Error approving volunteer:", error);
    return NextResponse.json({
      success: false,
      message: "Server error. Please try again."
    }, { status: 500 });
  }
}