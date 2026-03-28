import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { notifyCitizenIssueResolved, notifyVolunteerTaskCompleted } from '@/lib/helpers/notification.helper';

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

function toObjectId(id: string) {
  try { return new ObjectId(id); } catch { return null; }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getCurrentUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only admins can review and resolve issues' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ message: 'Invalid issue ID' }, { status: 400 });

    const body = await req.json();
    const { approved, rejectionReason } = body;

    const { db } = await connectToDatabase();
    const existing = await db.collection('issues').findOne({ _id: oid });
    
    if (!existing) {
      return NextResponse.json({ message: 'Issue not found' }, { status: 404 });
    }

    if (existing.status !== 'pending_review') {
      return NextResponse.json(
        { message: 'Issue is not pending review' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    
    if (approved) {
      // Approve and mark as resolved
      const updates = {
        status: 'resolved',
        resolvedAt: now,
        resolvedBy: user.id,
        resolvedByName: user.name,
        reviewedAt: now,
        reviewedBy: user.id,
        reviewNotes: body.reviewNotes || '',
        updatedAt: now,
      };

      await db.collection('issues').updateOne({ _id: oid }, { $set: updates });
      
      // Send notifications
      if (existing.reporterId) {
        await notifyCitizenIssueResolved(
          existing.reporterId,
          id,
          existing.title,
          existing.assignedTo?.name || 'a volunteer'
        );
      }
      
      if (existing.assignedToId) {
        await notifyVolunteerTaskCompleted(
          existing.assignedToId,
          id,
          existing.title
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Issue approved and marked as resolved',
      });
    } else {
      // Reject and send back for rework
      const updates = {
        status: 'in_progress',
        statusHistory: [
          ...(existing.statusHistory || []),
          {
            from: 'pending_review',
            to: 'in_progress',
            reason: rejectionReason,
            by: user.id,
            byName: user.name,
            timestamp: now,
          }
        ],
        rejectionReason,
        reviewNotes: body.reviewNotes || '',
        reviewedAt: now,
        reviewedBy: user.id,
        updatedAt: now,
      };

      await db.collection('issues').updateOne({ _id: oid }, { $set: updates });
      
      return NextResponse.json({
        success: true,
        message: 'Issue rejected. Volunteer needs to rework.',
      });
    }
  } catch (error: any) {
    console.error('POST /api/admin/issues/[id]/review error:', error);
    return NextResponse.json(
      { message: 'Failed to review issue', error: error.message },
      { status: 500 }
    );
  }
}