import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const user = getCurrentUser(req)
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { pollId } = await params
    const id = pollId;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid poll ID' }, { status: 400 })
    }

    const { optionId } = await req.json()
    if (!optionId) {
      return NextResponse.json({ message: 'Option ID is required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const poll = await db.collection('polls').findOne({ _id: new ObjectId(id) })

    if (!poll) return NextResponse.json({ message: 'Poll not found' }, { status: 404 })
    if (!poll.isActive || poll.expiresAt < new Date().toISOString()) {
      return NextResponse.json({ message: 'This poll has closed' }, { status: 409 })
    }

    // Check already voted
    const alreadyVoted = poll.voters?.some((v: any) => v.userId === user.id)
    if (alreadyVoted) {
      return NextResponse.json({ message: 'You have already voted on this poll' }, { status: 409 })
    }

    // Check option exists
    const optionExists = poll.options.some((o: any) => o.id === optionId)
    if (!optionExists) {
      return NextResponse.json({ message: 'Invalid option' }, { status: 400 })
    }

    const now = new Date().toISOString()

    // Increment option vote count + add voter record
    await db.collection('polls').updateOne(
      { _id: new ObjectId(id), 'options.id': optionId },
      {
        $inc: { 'options.$.votes': 1, totalVotes: 1 },
        $push: {
          voters: { userId: user.id, optionId, votedAt: now },
        } as any,
        $set: { updatedAt: now },
      }
    )

    // Refetch updated poll
    const updated = await db.collection('polls').findOne({ _id: new ObjectId(id) })
    const totalVotes = updated!.options.reduce((sum: number, o: any) => sum + (o.votes || 0), 0)

    return NextResponse.json({
      success: true,
      message: 'Vote recorded!',
      options: updated!.options.map((o: any) => ({
        id: o.id,
        text: o.text,
        votes: o.votes || 0,
        percentage: totalVotes > 0 ? Math.round(((o.votes || 0) / totalVotes) * 100) : 0,
      })),
      totalVotes,
    })
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to vote', error: error.message }, { status: 500 })
  }
}