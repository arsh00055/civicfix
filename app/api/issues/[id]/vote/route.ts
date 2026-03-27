import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
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

    const { id } = await params; // ✅ Await params
    const oid = toObjectId(id);
    if (!oid) return NextResponse.json({ message: 'Invalid issue ID' }, { status: 400 });

    const { db } = await connectToDatabase();
    const issue = await db.collection('issues').findOne({ _id: oid });
    if (!issue) return NextResponse.json({ message: 'Issue not found' }, { status: 404 });

    const voters: string[] = issue.voters || [];
    const hasVoted = voters.includes(user.id);

    let update: any;
    if (hasVoted) {
      update = {
        $pull:  { voters: user.id },
        $inc:   { upvotes: -1 },
        $set:   { updatedAt: new Date().toISOString() },
      };
    } else {
      update = {
        $addToSet: { voters: user.id },
        $inc:      { upvotes: 1 },
        $set:      { updatedAt: new Date().toISOString() },
      };
    }

    await db.collection('issues').updateOne({ _id: oid }, update);
    const updated = await db.collection('issues').findOne({ _id: oid });
    const { _id, ...rest } = updated!;

    return NextResponse.json({
      ...rest,
      id:      _id.toString(),
      voted:   !hasVoted,
      upvotes: updated?.upvotes || 0,
      message: hasVoted ? 'Vote removed' : 'Vote recorded',
    });
  } catch (error: any) {
    console.error('POST /api/issues/[id]/vote error:', error);
    return NextResponse.json(
      { message: 'Failed to vote', error: error.message },
      { status: 500 }
    );
  }
}