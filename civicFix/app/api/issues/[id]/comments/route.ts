import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { updateUserStatsAndCheckAchievements } from '@/lib/helpers/userStats.helper';
import { notifyReporterNewComment } from '@/lib/helpers/notification.helper';

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

function normaliseDoc(doc: any) {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

// Helper to generate unique comment ID
function generateCommentId() {
  return new ObjectId().toString();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) {
      return NextResponse.json({ message: 'Invalid issue ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const issue = await db.collection('issues').findOne(
      { _id: oid },
      { projection: { comments: 1 } }
    );
    
    if (!issue) {
      return NextResponse.json({ message: 'Issue not found' }, { status: 404 });
    }

    const comments = issue.comments || [];
    // Sort by createdAt descending (newest first)
    const sortedComments = [...comments].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(sortedComments);
  } catch (error: any) {
    console.error('GET /api/issues/[id]/comments error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch comments', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const oid = toObjectId(id);
    if (!oid) {
      return NextResponse.json({ message: 'Invalid issue ID' }, { status: 400 });
    }

    const body = await req.json();
    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ message: 'Comment text is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const issue = await db.collection('issues').findOne({ _id: oid });
    if (!issue) {
      return NextResponse.json({ message: 'Issue not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const commentId = generateCommentId();

    let avatar: string | undefined;
    try {
      const userObjectId = toObjectId(user.id);
      if (userObjectId) {
        const userDoc = await db.collection('users').findOne({ _id: userObjectId });
        avatar = userDoc?.avatar;
      }
    } catch {}

    const newComment = {
      id: commentId,
      userId: user.id,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: avatar || null,
      },
      text,
      upvotes: 0,
      isEdited: false,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('issues').updateOne(
      { _id: oid },
      {
        $push: { comments: newComment } as any,
        $inc: { commentsCount: 1 },
        $set: { updatedAt: now }
      }
    );

    if (issue.reporterId !== user.id) {
      await notifyReporterNewComment(issue.reporterId, id, issue.title, user.name, text);
    }

    // Update user stats for commenting
    await updateUserStatsAndCheckAchievements(
      user.id,
      user.role as 'citizen' | 'volunteer',
      { totalComments: 1, points: 3 } // +3 points for commenting
    );

    return NextResponse.json(newComment, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/issues/[id]/comments error:', error);
    return NextResponse.json(
      { message: 'Failed to post comment', error: error.message },
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
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ message: 'Comment ID required' }, { status: 400 });
    }

    const oid = toObjectId(id);
    if (!oid) {
      return NextResponse.json({ message: 'Invalid issue ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Check if issue exists and find the comment
    const issue = await db.collection('issues').findOne({ _id: oid });
    if (!issue) {
      return NextResponse.json({ message: 'Issue not found' }, { status: 404 });
    }

    const comment = issue.comments?.find((c: any) => c.id === commentId);
    if (!comment) {
      return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    // Check if user is authorized to delete (comment author or admin)
    if (comment.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Remove the comment from the array - CORRECT SYNTAX
    const result = await db.collection('issues').updateOne(
      { _id: oid },
      {
        $pull: { comments: { id: commentId } } as any,
        $inc: { commentsCount: -1 },
        $set: { updatedAt: new Date().toISOString() }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'Failed to delete comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/issues/[id]/comments error:', error);
    return NextResponse.json(
      { message: 'Failed to delete comment', error: error.message },
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
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('commentId');
    const body = await req.json();
    const text = body.text?.trim();

    if (!commentId) {
      return NextResponse.json({ message: 'Comment ID required' }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ message: 'Comment text is required' }, { status: 400 });
    }

    const oid = toObjectId(id);
    if (!oid) {
      return NextResponse.json({ message: 'Invalid issue ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Check if issue exists
    const issue = await db.collection('issues').findOne({ _id: oid });
    if (!issue) {
      return NextResponse.json({ message: 'Issue not found' }, { status: 404 });
    }

    const comment = issue.comments?.find((c: any) => c.id === commentId);
    if (!comment) {
      return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
    }

    // Check if user is authorized to edit (comment author or admin)
    if (comment.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Update the comment - CORRECT SYNTAX
    const result = await db.collection('issues').updateOne(
      { _id: oid, 'comments.id': commentId },
      {
        $set: {
          'comments.$.text': text,
          'comments.$.isEdited': true,
          'comments.$.updatedAt': new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'Failed to update comment' },
        { status: 500 }
      );
    }

    const updatedIssue = await db.collection('issues').findOne({ _id: oid });
    const updatedComment = updatedIssue?.comments?.find((c: any) => c.id === commentId);

    return NextResponse.json(updatedComment);
  } catch (error: any) {
    console.error('PUT /api/issues/[id]/comments error:', error);
    return NextResponse.json(
      { message: 'Failed to update comment', error: error.message },
      { status: 500 }
    );
  }
}