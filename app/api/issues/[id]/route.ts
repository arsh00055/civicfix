import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { db } = await connectToDatabase();

    console.log("🔍 Fetching issue with ID:", id);

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        message: "Invalid issue ID format"
      }, { status: 400 });
    }

    // Find issue by ID
    const issue = await db.collection('issues').findOne({
      _id: new ObjectId(id)
    });

    if (!issue) {
      return NextResponse.json({
        success: false,
        message: "Issue not found"
      }, { status: 404 });
    }

    console.log("✅ Issue found:", issue.title);

    // Find reporter details
    let reporter = null;
    if (issue.reporterId) {
      reporter = await db.collection('citizens').findOne(
        { _id: new ObjectId(issue.reporterId) },
        { projection: { name: 1, avatar: 1, email: 1 } }
      );
    }

    // Format response to match frontend Issue type
    const formattedIssue = {
      id: issue._id.toString(),
      title: issue.title || "Untitled Issue",
      description: issue.description || "No description provided",
      category: issue.category || "general",
      priority: issue.priority || "medium",
      status: issue.status || "reported",
      location: issue.location || "Unknown location",
      latitude: issue.latitude || 0,
      longitude: issue.longitude || 0,
      images: issue.images || [],
      reporterId: issue.reporterId,
      reporter: reporter ? {
        id: reporter._id.toString(),
        name: reporter.name,
        avatar: reporter.avatar || null
      } : {
        name: issue.reporterName || "Anonymous",
        avatar: null
      },
      volunteerId: issue.volunteerId,
      volunteer: issue.volunteerId ? {
        id: issue.volunteerId,
        name: issue.volunteerName || "Unknown Volunteer",
        avatar: null,
        role: "volunteer"
      } : null,
      votes: issue.votes || 0,
      commentsCount: issue.commentCount || 0,
      createdAt: issue.createdAt || new Date().toISOString(),
      updatedAt: issue.updatedAt || new Date().toISOString(),
      reportedAt: issue.createdAt || new Date().toISOString(),
      resolvedAt: issue.resolvedAt || null
    };

    // Return in the format frontend expects
    return NextResponse.json({
      success: true,
      issue: formattedIssue
    });

  } catch (error) {
    console.error("❌ Error fetching issue:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch issue details"
    }, { status: 500 });
  }
}