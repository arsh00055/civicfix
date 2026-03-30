import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { CITIZEN_ACHIEVEMENTS, VOLUNTEER_ACHIEVEMENTS } from "@/lib/achievements/definitions";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function verifyToken(token: string): { id: string; role: string } | null {
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, JWT_SECRET);
    return { id: decoded.id || decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const citizens = db.collection("citizens");

    // Get the user profile first
    const user = await citizens.findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { stats: 1, volunteerStats: 1, role: 1, achievements: 1 } }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isVolunteer = user.role === "volunteer";
    const definitions = isVolunteer ? VOLUNTEER_ACHIEVEMENTS : CITIZEN_ACHIEVEMENTS;
    const unlockedAchievementIds = (user.achievements || [])
      .filter((a: any) => a.unlockedAt !== null)
      .map((a: any) => a.id);

    // Build stats map
    const statsMap: Record<string, number> = isVolunteer
      ? {
          totalClaimed:        user.volunteerStats?.totalClaimed ?? 0,
          tasksCompleted:      user.volunteerStats?.tasksCompleted ?? 0,
          fastResponse:        user.volunteerStats?.fastResponseCount ?? 0,
          categoriesCompleted: user.volunteerStats?.uniqueCategories ?? 0,
          rating:              user.volunteerStats?.averageRating ?? 0,
          streak:              user.volunteerStats?.currentStreak ?? 0,
          level:               user.stats?.level ?? 1,
          points:              user.stats?.points ?? 0,
        }
      : {
          totalReports:    user.stats?.totalReports ?? 0,
          totalVotes:      user.stats?.totalVotes ?? 0,
          totalComments:   user.stats?.totalComments ?? 0,
          resolvedReports: user.stats?.resolvedReports ?? 0,
          level:           user.stats?.level ?? 1,
          points:          user.stats?.points ?? 0,
        };

    const achievements = definitions.map(def => {
      let currentValue = 0;
      switch (def.requirement.type) {
        case 'totalReports': currentValue = statsMap.totalReports ?? 0; break;
        case 'totalVotes': currentValue = statsMap.totalVotes ?? 0; break;
        case 'totalComments': currentValue = statsMap.totalComments ?? 0; break;
        case 'resolvedReports': currentValue = statsMap.resolvedReports ?? 0; break;
        case 'level': currentValue = statsMap.level ?? 0; break;
        case 'points': currentValue = statsMap.points ?? 0; break;
        case 'totalClaimed': currentValue = statsMap.totalClaimed ?? 0; break;
        case 'tasksCompleted': currentValue = statsMap.tasksCompleted ?? 0; break;
        case 'fastResponse': currentValue = statsMap.fastResponse ?? 0; break;
        case 'categoriesCompleted': currentValue = statsMap.categoriesCompleted ?? 0; break;
        case 'rating': currentValue = statsMap.rating ?? 0; break;
        case 'streak': currentValue = statsMap.streak ?? 0; break;
      }
      
      const target = def.requirement.target;
      const progress = Math.min(currentValue / target, 1);
      const unlocked = unlockedAchievementIds.includes(def.id);
      const userAchievement = (user.achievements || []).find((a: any) => a.id === def.id);

      return {
        ...def,
        current: currentValue,
        progress: Math.round(progress * 100) / 100,
        unlocked,
        unlockedAt: unlocked ? (userAchievement?.unlockedAt || null) : null,
      };
    });

    const unlocked = achievements.filter(a => a.unlocked);
    const totalPoints = unlocked.reduce((s, a) => s + a.points, 0);
    const completion = Math.round((unlocked.length / achievements.length) * 100);

    return NextResponse.json({
      achievements,
      summary: {
        total: achievements.length,
        unlocked: unlocked.length,
        locked: achievements.length - unlocked.length,
        totalPoints,
        completion,
      },
    });

  } catch (err) {
    console.error("GET /api/achievements error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}