// app/api/issues/available/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to get current user from token
function getCurrentUser(req: NextRequest): { id: string; role: string; name: string } | null {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies.get('auth_token')?.value;
    
    if (!token) return null;
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { 
      id: decoded.id || decoded.userId, 
      role: decoded.role, 
      name: decoded.name 
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

function toObjectId(id: string) {
  try { return new ObjectId(id); } catch { return null; }
}

export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only volunteers can view available tasks
    if (user.role !== 'volunteer' && user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only volunteers can view available tasks' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    
    // Get query parameters for filtering
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build filter for available tasks (not assigned)
    const filter: any = {
      status: 'reported',
      assignedToId: null,
      assignedTo: null,
    };
    
    if (category && category !== 'all') filter.category = category;
    if (priority && priority !== 'all') filter.priority = priority;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await db.collection('issues').countDocuments(filter);
    
    // Fetch available tasks
    const tasks = await db.collection('issues')
      .find(filter)
      .sort({ priority: -1, createdAt: 1 }) // Higher priority first, then oldest
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const totalPages = Math.ceil(total / limit);
    
    // Format tasks for volunteer view
    const formattedTasks = tasks.map(task => ({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      status: task.status,
      location: task.location,
      latitude: task.latitude,
      longitude: task.longitude,
      images: task.images,
      reportedBy: task.reporter?.name || 'Anonymous',
      reportedAt: task.reportedAt,
      estimatedTime: task.estimatedResolutionTime || 'Not specified',
      tags: task.tags || [],
      upvotes: task.upvotes,
      voters: task.voters || [],
    }));
    
    return NextResponse.json({
      tasks: formattedTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
    
  } catch (error: any) {
    console.error('GET /api/issues/available error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch available tasks', error: error.message },
      { status: 500 }
    );
  }
}