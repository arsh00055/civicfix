import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    // 🔐 Token check karo (authorization header ton)
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized - No token provided"
      }, { status: 401 });
    }

    // Token verify karo
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized - Invalid token"
      }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    // URL se pagination nikal lo
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Sirf is user de reports lai ke aao
    const query = { reporterId: decoded.userId };
    
    console.log('🔍 My reports query for user:', decoded.userId);

    const issues = await db.collection('issues')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('issues').countDocuments(query);

    // Format issues for frontend
    const formattedIssues = issues.map(issue => ({
      id: issue._id.toString(),
      title: issue.title,
      description: issue.description,
      category: issue.category,
      priority: issue.priority,
      status: issue.status,
      location: issue.location,
      latitude: issue.latitude,
      longitude: issue.longitude,
      images: issue.images || [],
      votes: issue.votes || 0,
      commentsCount: issue.commentCount || 0,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      volunteerId: issue.volunteerId
    }));

    return NextResponse.json({
      success: true,
      issues: formattedIssues,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error: any) {
    console.error("❌ Error fetching my reports:", error);

    // JWT error handling
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({
        success: false,
        message: "Unauthorized - Invalid token"
      }, { status: 401 });
    }

    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({
        success: false,
        message: "Unauthorized - Token expired"
      }, { status: 401 });
    }

    return NextResponse.json({
      success: false,
      message: "Failed to fetch your reports"
    }, { status: 500 });
  }
}