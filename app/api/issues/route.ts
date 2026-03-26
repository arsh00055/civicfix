import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // URL se filters nikal lo
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const reporterId = searchParams.get('reporterId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Filters build karo
    let query: any = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (reporterId) query.reporterId = reporterId;
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('🔍 Issues query:', query);
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Issues fetch karo
    const issues = await db.collection('issues')
      .find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Total count for pagination
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
      reporterId: issue.reporterId,
      reporter: issue.reporterName ? { name: issue.reporterName } : undefined,
      volunteerId: issue.volunteerId,
      votes: issue.votes || 0,
      commentsCount: issue.commentCount || 0,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt
    }));
    
    return NextResponse.json({
      success: true,
      issues: formattedIssues,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
    
  } catch (error) {
    console.error("❌ Error fetching issues:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch issues"
    }, { status: 500 });
  }
}