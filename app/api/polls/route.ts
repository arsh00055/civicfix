import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function getCurrentUser(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies.get('auth_token')?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { id: decoded.id || decoded.userId, role: decoded.role, name: decoded.name }
  } catch { return null }
}

// GET /api/polls — list active polls
export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req)
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { db } = await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'active'

    const filter: any = {}
    if (status === 'active') {
      filter.expiresAt = { $gt: new Date().toISOString() }
      filter.isActive = true
    } else if (status === 'closed') {
      filter.$or = [
        { expiresAt: { $lte: new Date().toISOString() } },
        { isActive: false }
      ]
    }

    const polls = await db.collection('polls')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray()

    const formatted = polls.map(poll => {
      const totalVotes = poll.options.reduce((sum: number, o: any) => sum + (o.votes || 0), 0)
      const userVote = poll.voters?.find((v: any) => v.userId === user.id)

      return {
        id: poll._id.toString(),
        question: poll.question,
        description: poll.description,
        options: poll.options.map((o: any) => ({
          id: o.id,
          text: o.text,
          votes: o.votes || 0,
          percentage: totalVotes > 0 ? Math.round(((o.votes || 0) / totalVotes) * 100) : 0,
        })),
        totalVotes,
        createdBy: poll.createdBy,
        createdAt: poll.createdAt,
        expiresAt: poll.expiresAt,
        isActive: poll.isActive,
        hasVoted: !!userVote,
        userVoteId: userVote?.optionId || null,
        category: poll.category || 'general',
      }
    })

    return NextResponse.json({ success: true, polls: formatted })
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch polls', error: error.message }, { status: 500 })
  }
}

// POST /api/polls — create a new poll (admin or any user)
export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser(req)
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { question, description, options, durationDays = 7, category = 'general' } = await req.json()

    if (!question?.trim()) {
      return NextResponse.json({ message: 'Question is required' }, { status: 400 })
    }
    if (!options || options.length < 2 || options.length > 6) {
      return NextResponse.json({ message: 'Polls need 2-6 options' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()

    const poll = {
      question: question.trim(),
      description: description?.trim() || null,
      options: options.map((text: string, i: number) => ({
        id: `option_${i}`,
        text: text.trim(),
        votes: 0,
      })),
      category,
      createdBy: { id: user.id, name: user.name, role: user.role },
      voters: [],
      totalVotes: 0,
      isActive: true,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    }

    const result = await db.collection('polls').insertOne(poll)

    return NextResponse.json({
      success: true,
      poll: { ...poll, id: result.insertedId.toString() },
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to create poll', error: error.message }, { status: 500 })
  }
}