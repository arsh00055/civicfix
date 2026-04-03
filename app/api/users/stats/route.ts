// app/api/users/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

// GET /api/users/stats
export async function GET(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req)
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    if (!ObjectId.isValid(currentUser.id)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 })
    }

    if (currentUser.role === 'citizen') {
      const user = await db.collection('citizens').findOne(
        { _id: new ObjectId(currentUser.id) },
        { projection: { stats: 1, achievements: 1 } }
      )

      if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })

      const unlockedAchievements = (user.achievements || []).filter(
        (a: any) => a.unlockedAt !== null
      ).length

      return NextResponse.json({
        success: true,
        points:              user.stats?.points          || 0,
        level:               user.stats?.level           || 1,
        totalReports:        user.stats?.totalReports    || 0,
        resolvedReports:     user.stats?.resolvedReports || 0,
        totalVotes:          user.stats?.totalVotes      || 0,
        totalComments:       user.stats?.totalComments   || 0,
        reputation:          user.stats?.reputation      || 0,
        unlockedAchievements,
      })
    }

    if (currentUser.role === 'volunteer') {
      const user = await db.collection('volunteers').findOne(
        { _id: new ObjectId(currentUser.id) },
        { projection: { stats: 1, volunteerStats: 1, rating: 1, completedTasks: 1, totalTasks: 1 } }
      )

      if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })

      return NextResponse.json({
        success: true,
        points:         user.stats?.points                    || 0,
        level:          Math.floor((user.stats?.points || 0) / 100) + 1,
        tasksCompleted: user.volunteerStats?.tasksCompleted   || user.completedTasks || 0,
        totalClaimed:   user.volunteerStats?.totalClaimed     || 0,
        pointsEarned:   user.volunteerStats?.pointsEarned     || 0,
        rating:         user.volunteerStats?.averageRating    || user.rating || 0,
        totalRatings:   user.volunteerStats?.totalRatings     || 0,
      })
    }

    if (currentUser.role === 'admin') {
      const user = await db.collection('admins').findOne(
        { _id: new ObjectId(currentUser.id) },
        { projection: { stats: 1 } }
      )

      if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })

      // Give admins aggregate platform stats
      const [totalIssues, resolvedIssues, totalUsers] = await Promise.all([
        db.collection('issues').countDocuments({}),
        db.collection('issues').countDocuments({ status: { $in: ['resolved', 'closed'] } }),
        db.collection('citizens').countDocuments({}),
      ])

      return NextResponse.json({
        success: true,
        points:        user.stats?.points || 0,
        level:         user.stats?.level  || 1,
        totalIssues,
        resolvedIssues,
        totalUsers,
      })
    }

    return NextResponse.json({ message: 'Unknown role' }, { status: 400 })
  } catch (error: any) {
    console.error('GET /api/users/stats error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch stats', error: error.message },
      { status: 500 }
    )
  }
}