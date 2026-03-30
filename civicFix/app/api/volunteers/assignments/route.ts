import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getCurrentUser(req: NextRequest): { id: string; role: string; name: string } | null {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies.get('auth_token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { id: decoded.id || decoded.userId, role: decoded.role, name: decoded.name };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'volunteer' && user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only volunteers can view assignments' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const filter: any = {
      assignedToId: user.id,
    };
    
    if (status && status !== 'all') {
      filter.status = status;
    } else {
      filter.status = { $nin: ['resolved', 'closed'] };
    }
    
    const skip = (page - 1) * limit;
    
    const total = await db.collection('issues').countDocuments(filter);
    
    const assignments = await db.collection('issues')
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const totalPages = Math.ceil(total / limit);
    
    const formattedAssignments = assignments.map(assignment => {
      let progress = 0;
      if (assignment.status === 'assigned') progress = 25;
      if (assignment.status === 'in_progress') progress = 50;
      if (assignment.status === 'in_review') progress = 75;
      if (assignment.status === 'resolved') progress = 100;
      
      return {
        id: assignment._id.toString(),
        taskId: assignment._id.toString(),
        title: assignment.title,
        description: assignment.description,
        category: assignment.category,
        priority: assignment.priority,
        status: assignment.status,
        location: assignment.location,
        latitude: assignment.latitude,
        longitude: assignment.longitude,
        images: assignment.images,
        reportedBy: assignment.reporter?.name || 'Anonymous',
        reportedAt: assignment.reportedAt,
        claimedAt: assignment.assignedAt || assignment.updatedAt,
        updatedAt: assignment.updatedAt,
        progress: progress,
        commentsCount: assignment.commentsCount || 0,
        upvotes: assignment.upvotes || 0,
        tags: assignment.tags || [],
        estimatedResolutionTime: assignment.estimatedResolutionTime,
        resolutionNotes: assignment.resolutionNotes,
      };
    });
    
    return NextResponse.json({
      assignments: formattedAssignments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
    
  } catch (error: any) {
    console.error('GET /api/volunteers/assignments error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch assignments', error: error.message },
      { status: 500 }
    );
  }
}