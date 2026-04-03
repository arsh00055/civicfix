// app/api/issues/[id]/rate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'


// POST /api/issues/[id]/rate — citizen rates a resolved issue
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getCurrentUser(req)
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid issue ID' }, { status: 400 })
    }

    const { rating, comment } = await req.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const issue = await db.collection('issues').findOne({ _id: new ObjectId(id) })

    if (!issue) return NextResponse.json({ message: 'Issue not found' }, { status: 404 })

    // Only the reporter can rate
    if (issue.reporterId !== user.id) {
      return NextResponse.json(
        { message: 'Only the issue reporter can rate the resolution' },
        { status: 403 }
      )
    }

    // Only resolved issues can be rated
    if (!['resolved', 'closed'].includes(issue.status)) {
      return NextResponse.json(
        { message: 'Only resolved issues can be rated' },
        { status: 409 }
      )
    }

    // Prevent double rating
    if (issue.resolutionRating) {
      return NextResponse.json(
        { message: 'You have already rated this resolution' },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()

    // Save rating on the issue
    await db.collection('issues').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          resolutionRating: {
            score: rating,
            comment: comment?.trim() || null,
            ratedBy: user.id,
            ratedAt: now,
          },
          updatedAt: now,
        },
      }
    )

    // Update volunteer's average rating if assigned
    if (issue.assignedToId) {
      try {
        // Get all rated issues for this volunteer
        const ratedIssues = await db.collection('issues').find({
          assignedToId: issue.assignedToId,
          'resolutionRating.score': { $exists: true },
        }).toArray()

        const totalScore = ratedIssues.reduce((sum, i) => sum + (i.resolutionRating?.score || 0), 0)
        const avgRating  = totalScore / ratedIssues.length

        if (ObjectId.isValid(issue.assignedToId)) {
          await db.collection('volunteers').updateOne(
            { _id: new ObjectId(issue.assignedToId) },
            {
              $set: {
                rating: Math.round(avgRating * 10) / 10,
                'volunteerStats.averageRating': Math.round(avgRating * 10) / 10,
                'volunteerStats.totalRatings': ratedIssues.length,
                updatedAt: now,
              },
            }
          )
        }
      } catch (e) {
        console.error('Failed to update volunteer rating:', e)
        // Non-fatal — rating is already saved on issue
      }
    }

    // Award points to citizen for rating
    try {
      await db.collection('citizens').updateOne(
        { _id: new ObjectId(user.id) },
        { $inc: { 'stats.points': 5 } }
      )
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Rating submitted successfully! +5 points awarded.',
      rating: { score: rating, comment },
    })
  } catch (error: any) {
    console.error('POST /api/issues/[id]/rate error:', error)
    return NextResponse.json(
      { message: 'Failed to submit rating', error: error.message },
      { status: 500 }
    )
  }
}

// GET /api/issues/[id]/rate — check if already rated
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getCurrentUser(req)
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid issue ID' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const issue = await db.collection('issues').findOne(
      { _id: new ObjectId(id) },
      { projection: { resolutionRating: 1, status: 1, reporterId: 1 } }
    )

    if (!issue) return NextResponse.json({ message: 'Issue not found' }, { status: 404 })

    return NextResponse.json({
      success: true,
      canRate: issue.reporterId === user.id && ['resolved', 'closed'].includes(issue.status) && !issue.resolutionRating,
      hasRated: !!issue.resolutionRating,
      rating: issue.resolutionRating || null,
    })
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch rating', error: error.message }, { status: 500 })
  }
}