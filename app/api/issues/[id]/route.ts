
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

function toObjectId(id: string) {
  try { return new ObjectId(id); } catch { return null; }
}

function normaliseIssue(doc: any) {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ Await params first
    const oid = toObjectId(id);
    if (!oid) {
      return NextResponse.json({ message: 'Invalid issue ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const issue = await db.collection('issues').findOne({ _id: oid });

    if (!issue) {
      return NextResponse.json({ message: 'Issue not found' }, { status: 404 });
    }

    db.collection('issues').updateOne({ _id: oid }, { $inc: { views: 1 } }).catch(() => {});

    return NextResponse.json(normaliseIssue(issue));
  } catch (error: any) {
    console.error('GET /api/issues/[id] error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch issue', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getCurrentUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ message: 'Invalid issue ID' }, { status: 400 });

    const { db } = await connectToDatabase();
    const existing = await db.collection('issues').findOne({ _id: oid });
    if (!existing) return NextResponse.json({ message: 'Issue not found' }, { status: 404 });

    const canEdit =
      user.role === 'admin' ||
      existing.reporterId === user.id ||
      (user.role === 'volunteer' && existing.assignedTo?.id === user.id);

    if (!canEdit) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    const allowed = [
      'title', 'description', 'category', 'priority', 'status',
      'location', 'latitude', 'longitude', 'images',
      'resolutionNotes', 'estimatedResolutionTime', 'tags',
      'resolutionProof', // Add this to allowed fields
    ];
    const updates: Record<string, any> = { updatedAt: new Date().toISOString() };
    
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    // Handle resolution proof submission
    if (body.status === 'pending_review' && body.resolutionNotes && body.resolutionProof) {
      updates.resolutionNotes = body.resolutionNotes;
      updates.resolutionProof = body.resolutionProof;
      updates.submittedForReviewAt = new Date().toISOString();
    }

    // Handle admin resolution
    if (body.status === 'resolved' && !existing.resolvedAt && user.role === 'admin') {
      updates.resolvedAt = new Date().toISOString();
      updates.resolvedBy = user.id;
      updates.resolvedByName = user.name;
      updates.reviewedAt = new Date().toISOString();
    }

    await db.collection('issues').updateOne({ _id: oid }, { $set: updates });
    const updated = await db.collection('issues').findOne({ _id: oid });

    return NextResponse.json(normaliseIssue(updated!));
  } catch (error: any) {
    console.error('PUT /api/issues/[id] error:', error);
    return NextResponse.json(
      { message: 'Failed to update issue', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getCurrentUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params; // ✅ Await params first
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ message: 'Invalid issue ID' }, { status: 400 });

    const { db } = await connectToDatabase();
    const existing = await db.collection('issues').findOne({ _id: oid });
    if (!existing) return NextResponse.json({ message: 'Issue not found' }, { status: 404 });

    const canDelete = user.role === 'admin' || existing.reporterId === user.id;
    if (!canDelete) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    await db.collection('issues').deleteOne({ _id: oid });
    await db.collection('comments').deleteMany({ issueId: id });

    return NextResponse.json({ message: 'Issue deleted successfully', id });
  } catch (error: any) {
    console.error('DELETE /api/issues/[id] error:', error);
    return NextResponse.json(
      { message: 'Failed to delete issue', error: error.message },
      { status: 500 }
    );
  }
}