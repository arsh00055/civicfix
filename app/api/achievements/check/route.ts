import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { checkAndAwardAchievements } from "@/lib/services/achievementService";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT verification helper
function verifyToken(token: string): { id: string; role: string } | null {
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, JWT_SECRET);
    return { id: decoded.id || decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyToken(authHeader.split(" ")[1]);
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
    
    // Build stats object
    const stats: Record<string, number> = isVolunteer
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

    // Check and award achievements
    const { newlyUnlocked, pointsAwarded } = await checkAndAwardAchievements(
      decoded.id,
      user.role as 'citizen' | 'volunteer',
      stats
    );

    return NextResponse.json({
      newlyUnlocked,
      pointsAwarded,
      message: newlyUnlocked.length > 0
        ? `🎉 ${newlyUnlocked.length} new achievement(s) unlocked! +${pointsAwarded} points!`
        : "No new achievements",
    });

  } catch (err) {
    console.error("POST /api/achievements/check error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}