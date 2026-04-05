import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import {
  CITIZEN_ACHIEVEMENTS,
  VOLUNTEER_ACHIEVEMENTS,
  ADMIN_ACHIEVEMENTS,
  AchievementDefinition,
} from "@/lib/achievements/definitions";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

type UserRole = 'citizen' | 'volunteer' | 'admin';

function getCollectionName(role: UserRole) {
  switch (role) {
    case 'volunteer': return 'volunteers';
    case 'admin':     return 'admins';
    default:          return 'citizens';
  }
}

function getDefinitions(role: UserRole): AchievementDefinition[] {
  switch (role) {
    case 'volunteer': return VOLUNTEER_ACHIEVEMENTS;
    case 'admin':     return ADMIN_ACHIEVEMENTS;
    default:          return CITIZEN_ACHIEVEMENTS;
  }
}

function buildStatsMap(role: UserRole, user: any): Record<string, number> {
  switch (role) {
    case 'volunteer':
      return {
        totalClaimed:        user.volunteerStats?.totalClaimed        ?? 0,
        tasksCompleted:      user.volunteerStats?.tasksCompleted       ?? 0,
        fastResponse:        user.volunteerStats?.fastResponseCount    ?? 0,
        categoriesCompleted: user.volunteerStats?.uniqueCategories     ?? 0,
        rating:              user.volunteerStats?.averageRating        ?? 0,
        streak:              user.volunteerStats?.currentStreak        ?? 0,
        level:               user.stats?.level                         ?? 1,
        points:              user.stats?.points                        ?? 0,
      };

    case 'admin':
      return {
        issuesReviewed:   user.stats?.issuesReviewed   ?? 0,
        reportsGenerated: user.stats?.reportsGenerated ?? 0,
        usersManaged:     user.stats?.usersManaged     ?? 0,
        systemUptime:     user.stats?.systemUptime     ?? 0,
        level:            user.stats?.level            ?? 1,
        points:           user.stats?.points           ?? 0,
      };

    default: // citizen
      return {
        totalReports:    user.stats?.totalReports    ?? 0,
        totalVotes:      user.stats?.totalVotes      ?? 0,
        totalComments:   user.stats?.totalComments   ?? 0,
        resolvedReports: user.stats?.resolvedReports ?? 0,
        level:           user.stats?.level           ?? 1,
        points:          user.stats?.points          ?? 0,
      };
  }
}

export async function GET(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    console.log('currentUser', currentUser);

    const role = currentUser.role as UserRole;

    const { db } = await connectToDatabase();
    const col = db.collection(getCollectionName(role));

    const user = await col.findOne(
      { _id: new ObjectId(currentUser.id) },
      { projection: { stats: 1, volunteerStats: 1, role: 1, achievements: 1 } }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const definitions = getDefinitions(role);
    const statsMap    = buildStatsMap(role, user);

    const unlockedIds: string[] = (user.achievements || [])
      .filter((a: any) => a.unlockedAt !== null)
      .map((a: any) => a.id);

    const achievements = definitions.map(def => {
      // stat key in the definition matches the statsMap key directly
      const currentValue = statsMap[def.requirement.type] ?? 0;
      const target       = def.requirement.target;
      const unlocked     = unlockedIds.includes(def.id);
      const record       = (user.achievements || []).find((a: any) => a.id === def.id);

      return {
        ...def,
        current:    currentValue,
        progress:   Math.round(Math.min(currentValue / target, 1) * 100) / 100,
        unlocked,
        unlockedAt: unlocked ? (record?.unlockedAt ?? null) : null,
      };
    });

    const unlocked    = achievements.filter(a => a.unlocked);
    const totalPoints = unlocked.reduce((sum, a) => sum + a.points, 0);
    const completion  = achievements.length > 0
      ? Math.round((unlocked.length / achievements.length) * 100)
      : 0;

    return NextResponse.json({
      achievements,
      summary: {
        total:      achievements.length,
        unlocked:   unlocked.length,
        locked:     achievements.length - unlocked.length,
        totalPoints,
        completion,
      },
    });

  } catch (err) {
    console.error('GET /api/achievements error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}