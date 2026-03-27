import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { notifyAdminsNewIssue, notifyAdminsUrgentIssue } from '@/lib/helpers/notification.helper';

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

function normaliseIssue(doc: any) {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const status    = searchParams.get('status')    || '';
    const category  = searchParams.get('category')  || '';
    const priority  = searchParams.get('priority')  || '';
    const search    = searchParams.get('search')    || '';
    const page      = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit     = Math.min(50, parseInt(searchParams.get('limit') || '10'));
    const sortBy    = searchParams.get('sortBy')    || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Build MongoDB filter
    const filter: Record<string, any> = {};
    if (status   && status   !== 'all') filter.status   = status;
    if (category && category !== 'all') filter.category = category;
    if (priority && priority !== 'all') filter.priority = priority;
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location:    { $regex: search, $options: 'i' } },
      ];
    }

    const sortField: Record<string, any> = { [sortBy]: sortOrder };
    const skip = (page - 1) * limit;

    const [issues, total] = await Promise.all([
      db.collection('issues')
        .find(filter)
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('issues').countDocuments(filter),
    ]);

    return NextResponse.json({
      issues: issues.map(normaliseIssue),
      total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('GET /api/issues error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch issues', error: error.message },
      { status: 500 }
    );
  }
}

// app/api/issues/route.ts - POST handler
export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    const {
      title,
      description,
      category,
      priority,
      status,
      severity,
      location,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      images,
      videos,
      documents,
      tags,
      estimatedResolutionTime,
      actualResolutionTime,
      resolutionNotes,
      metadata,
    } = body;

    // Validate required fields
    if (!title?.trim()) return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    if (!description?.trim()) return NextResponse.json({ message: 'Description is required' }, { status: 400 });
    if (!category?.trim()) return NextResponse.json({ message: 'Category is required' }, { status: 400 });
    if (!location?.trim() && (!latitude || !longitude)) {
      return NextResponse.json({ message: 'Location or coordinates are required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const now = new Date().toISOString();

    let reporterDetails = {
      id: user.id,
      name: user.name,
    };
    
    try {
      const userObjectId = new ObjectId(user.id);
      if (userObjectId) {
        const userDoc = await db.collection('users').findOne({ _id: userObjectId });
        if (userDoc) {
          reporterDetails = {
            id: user.id,
            name: userDoc.name || user.name,
          };
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }

    const newIssue = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      priority: priority || 'medium',
      status: status || 'reported',
      location: location?.trim() || `${latitude}, ${longitude}`,
      latitude: latitude || 0,
      longitude: longitude || 0,
      images: images || [],
      severity: severity || null,
      address: address || null,
      city: city || null,
      state: state || null,
      zipCode: zipCode || null,
      videos: videos || [],
      documents: documents || [],
      tags: tags || [],
      estimatedResolutionTime: estimatedResolutionTime || null,
      actualResolutionTime: actualResolutionTime || null,
      resolutionNotes: resolutionNotes || null,
      metadata: metadata || {},
      reporterId: user.id,
      reporter: reporterDetails,
      assignedToId: null,
      assignedTo: null,
      upvotes: 0,
      voters: [],
      views: 0,
      commentsCount: 0,
      comments: [],
      createdAt: now,
      updatedAt: now,
      reportedAt: now,
      reviewedAt: null,
      assignedAt: null,
      startedAt: null,
      resolvedAt: null,
      closedAt: null,
    };

    const result = await db.collection('issues').insertOne(newIssue);
    const issueId = result.insertedId.toString();
    const issuePriority = priority || 'medium';

    // 🔔 Send notifications based on priority
    if (issuePriority === 'critical' || issuePriority === 'high') {
      await notifyAdminsUrgentIssue(issueId, title, user.name, issuePriority, location);
    } else {
      await notifyAdminsNewIssue(issueId, title, user.name, issuePriority);
    }

    return NextResponse.json(
      { ...newIssue, id: issueId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/issues error:', error);
    return NextResponse.json(
      { message: 'Failed to create issue', error: error.message },
      { status: 500 }
    );
  }
}