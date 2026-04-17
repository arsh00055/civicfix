// lib/services/achievementService.ts
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import {
  CITIZEN_ACHIEVEMENTS,
  VOLUNTEER_ACHIEVEMENTS,
  ADMIN_ACHIEVEMENTS,
  AchievementDefinition,
} from "@/lib/achievements/definitions";
import { notifyAchievementUnlocked } from "@/lib/helpers/notification.helper";

interface UserStats {
  // citizen
  totalReports?: number;
  totalVotes?: number;
  totalComments?: number;
  resolvedReports?: number;
  // volunteer
  totalClaimed?: number;
  tasksCompleted?: number;
  fastResponse?: number;
  categoriesCompleted?: number;
  rating?: number;
  streak?: number;
  // admin
  issuesReviewed?: number;
  reportsGenerated?: number;
  usersManaged?: number;
  systemUptime?: number;
  // shared
  level?: number;
  points?: number;
}

type UserRole = 'citizen' | 'volunteer' | 'admin';

function getCollection(role: UserRole) {
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

export async function checkAndAwardAchievements(
  userId: string,
  role: UserRole,
  stats: UserStats
): Promise<{ newlyUnlocked: string[]; pointsAwarded: number }> {
  try {
    const { db } = await connectToDatabase();
    const col = db.collection(getCollection(role));

    const user = await col.findOne(
      { _id: new ObjectId(userId) },
      { projection: { achievements: 1, stats: 1 } }
    );

    if (!user) return { newlyUnlocked: [], pointsAwarded: 0 };

    const definitions = getDefinitions(role);

    const alreadyUnlocked: string[] = (user.achievements || [])
      .filter((a: any) => a.unlockedAt !== null)
      .map((a: any) => a.id);

    const now = new Date().toISOString();
    const newlyUnlocked: string[] = [];
    let pointsToAdd = 0;
    const unlockedAchievements: AchievementDefinition[] = [];

    for (const def of definitions) {
      if (alreadyUnlocked.includes(def.id)) continue;

      const currentValue = stats[def.requirement.type as keyof UserStats] ?? 0;

      if (currentValue >= def.requirement.target) {
        newlyUnlocked.push(def.id);
        pointsToAdd += def.points;
        unlockedAchievements.push(def);
      }
    }

    if (newlyUnlocked.length > 0) {
      for (const id of newlyUnlocked) {
        const existing = (user.achievements || []).find((a: any) => a.id === id);

        if (existing) {
          await col.updateOne(
            { _id: new ObjectId(userId), "achievements.id": id },
            { $set: { "achievements.$.unlockedAt": now } } as any
          );
        } else {
          await col.updateOne(
            { _id: new ObjectId(userId) },
            { $push: { achievements: { id, unlockedAt: now } } } as any
          );
        }
      }

      for (const achievement of unlockedAchievements) {
        await notifyAchievementUnlocked(
          userId,
          achievement.name,
          achievement.tier,
          achievement.points,
          achievement.id,
          role
        );
      }
    }

    return { newlyUnlocked, pointsAwarded: pointsToAdd };
  } catch (error) {
    console.error('Error checking achievements:', error);
    return { newlyUnlocked: [], pointsAwarded: 0 };
  }
}