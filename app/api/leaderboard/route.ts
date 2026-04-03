import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'


// GET /api/leaderboard?period=weekly|monthly|alltime
export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser(req)
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'monthly' // weekly | monthly | alltime

    const { db } = await connectToDatabase()

    // Date filter based on period
    let dateFilter: any = {}
    const now = new Date()
    if (period === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = { resolvedAt: { $gte: weekAgo.toISOString() } }
    } else if (period === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = { resolvedAt: { $gte: monthAgo.toISOString() } }
    }

    // Aggregate resolved issues per volunteer
    const pipeline: any[] = [
      {
        $match: {
          status: { $in: ['resolved', 'closed'] },
          assignedToId: { $exists: true, $ne: null },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: '$assignedToId',
          tasksCompleted: { $sum: 1 },
          avgPriority: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ['$priority', 'critical'] }, then: 4 },
                  { case: { $eq: ['$priority', 'high'] }, then: 3 },
                  { case: { $eq: ['$priority', 'medium'] }, then: 2 },
                  { case: { $eq: ['$priority', 'low'] }, then: 1 },
                ],
                default: 1,
              },
            },
          },
        },
      },
      { $sort: { tasksCompleted: -1 } },
      { $limit: 20 },
    ]

    const issueStats = await db.collection('issues').aggregate(pipeline).toArray()

    // Enrich with volunteer profile data
    const leaderboard = await Promise.all(
      issueStats.map(async (stat, index) => {
        const volunteer = await db.collection('volunteers').findOne(
          { _id: { $exists: true } },
          { projection: { password: 0 } }
        )

        // Find by string ID match
        const vol = await db.collection('volunteers').findOne(
          {},
          { projection: { password: 0 } }
        )

        // Use aggregation to find by string id
        const volData = await db.collection('volunteers').findOne(
          { $or: [{ _id: stat._id }, { id: stat._id }] },
          { projection: { password: 0 } }
        )

        // Try ObjectId lookup
        let volunteerData = null
        try {
          const { ObjectId } = await import('mongodb')
          if (ObjectId.isValid(stat._id)) {
            volunteerData = await db.collection('volunteers').findOne(
              { _id: new ObjectId(stat._id) },
              { projection: { password: 0 } }
            )
          }
        } catch {}

        const name = volunteerData?.name || 'Unknown Volunteer'
        const avatar = volunteerData?.avatar || null
        const rating = volunteerData?.rating || volunteerData?.volunteerStats?.averageRating || 0
        const points = volunteerData?.volunteerStats?.pointsEarned ||
                       volunteerData?.stats?.points || 0

        return {
          rank: index + 1,
          volunteerId: stat._id,
          name,
          avatar,
          tasksCompleted: stat.tasksCompleted,
          points,
          rating: Math.round(rating * 10) / 10,
          isCurrentUser: stat._id === user.id,
        }
      })
    )

    // Find current user's rank if not in top 20
    let currentUserRank = null
    const userInLeaderboard = leaderboard.find(v => v.isCurrentUser)
    if (!userInLeaderboard && user.role === 'volunteer') {
      const userStats = issueStats.findIndex(s => s._id === user.id)
      if (userStats === -1) {
        // Count how many volunteers have more completions
        const userIssues = await db.collection('issues').countDocuments({
          assignedToId: user.id,
          status: { $in: ['resolved', 'closed'] },
          ...dateFilter,
        })
        const betterVolunteers = await db.collection('issues').aggregate([
          { $match: { status: { $in: ['resolved', 'closed'] }, ...dateFilter } },
          { $group: { _id: '$assignedToId', count: { $sum: 1 } } },
          { $match: { count: { $gt: userIssues } } },
          { $count: 'total' },
        ]).toArray()

        currentUserRank = {
          rank: (betterVolunteers[0]?.total || 0) + 1,
          tasksCompleted: userIssues,
        }
      }
    }

    return NextResponse.json({
      success: true,
      period,
      leaderboard,
      currentUserRank,
      updatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('GET /api/leaderboard error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch leaderboard', error: error.message },
      { status: 500 }
    )
  }
}