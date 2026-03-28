import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { 
  notifyVolunteerTaskClaimed, 
  notifyAdminIssueClaimed, 
  notifyIssueClaimed
} from '@/lib/helpers/notification.helper';
import { updateUserStatsAndCheckAchievements } from '@/lib/helpers/userStats.helper';

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

    if (user.role !== 'volunteer') {
      return NextResponse.json(
        { message: 'Only volunteers can claim issues' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ message: 'Invalid issue ID' }, { status: 400 });

    const { db } = await connectToDatabase();
    const issue = await db.collection('issues').findOne({ _id: oid });

    await updateUserStatsAndCheckAchievements(
      user.id,
      'volunteer',
      { totalClaimed: 1, points: 15 } // +15 points for claiming a task
    );
    
    if (!issue) return NextResponse.json({ message: 'Issue not found' }, { status: 404 });

    if (!['reported', 'in_review'].includes(issue.status)) {
      return NextResponse.json(
        { message: `Issue cannot be claimed in '${issue.status}' status` },
        { status: 409 }
      );
    }

    if (issue.assignedToId) {
      return NextResponse.json(
        { message: 'Issue is already assigned to a volunteer' },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const updates = {
      status:       'assigned',
      assignedToId: user.id,
      assignedTo: {
        id:   user.id,
        name: user.name,
        role: 'volunteer',
      },
      assignedAt: now,
      updatedAt:  now,
    };

    await db.collection('issues').updateOne({ _id: oid }, { $set: updates });
    const updated = await db.collection('issues').findOne({ _id: oid });
    const { _id, ...rest } = updated!;

    // 🔔 Send notifications
    await notifyIssueClaimed(id, issue.title, user.name);
    await notifyVolunteerTaskClaimed(user.id, id, issue.title, issue.reporter?.name || 'Anonymous');
    await notifyAdminIssueClaimed(id, issue.title, user.name);

    return NextResponse.json({ ...rest, id: _id.toString() });
  } catch (error: any) {
    console.error('POST /api/issues/[id]/claim error:', error);
    return NextResponse.json(
      { message: 'Failed to claim issue', error: error.message },
      { status: 500 }
    );
  }
}