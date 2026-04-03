// lib/services/achievementService.ts
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { CITIZEN_ACHIEVEMENTS, VOLUNTEER_ACHIEVEMENTS, AchievementDefinition } from "@/lib/achievements/definitions";
import { notifyAchievementUnlocked } from "@/lib/helpers/notification.helper";

interface UserStats {
  totalReports?: number;
  totalVotes?: number;
  totalComments?: number;
  resolvedReports?: number;
  level?: number;
  points?: number;
  totalClaimed?: number;
  tasksCompleted?: number;
  fastResponse?: number;
  categoriesCompleted?: number;
  rating?: number;
  streak?: number;
}

export async function checkAndAwardAchievements(
  userId: string,
  role: 'citizen' | 'volunteer',
  stats: UserStats
): Promise<{ newlyUnlocked: string[]; pointsAwarded: number }> {
  try {
    const { db } = await connectToDatabase();
    const col = db.collection(
      role === 'volunteer' ? 'volunteers' : 'citizens'
    );
    const user = await col.findOne(
      { _id: new ObjectId(userId) },
      { projection: { achievements: 1, stats: 1 } }
    );

    if (!user) {
      return { newlyUnlocked: [], pointsAwarded: 0 };
    }

    const definitions = role === 'volunteer' ? VOLUNTEER_ACHIEVEMENTS : CITIZEN_ACHIEVEMENTS;
    
    // Get already unlocked achievement IDs (where unlockedAt is not null)
    const alreadyUnlocked: string[] = (user.achievements || [])
      .filter((a: any) => a.unlockedAt !== null)
      .map((a: any) => a.id);
    
    const now = new Date().toISOString();
    const newlyUnlocked: string[] = [];
    let pointsToAdd = 0;
    const unlockedAchievements: AchievementDefinition[] = [];

    for (const def of definitions) {
      if (alreadyUnlocked.includes(def.id)) continue;
      
      let currentValue = 0;
      switch (def.requirement.type) {
        case 'totalReports':
          currentValue = stats.totalReports ?? 0;
          break;
        case 'totalVotes':
          currentValue = stats.totalVotes ?? 0;
          break;
        case 'totalComments':
          currentValue = stats.totalComments ?? 0;
          break;
        case 'resolvedReports':
          currentValue = stats.resolvedReports ?? 0;
          break;
        case 'level':
          currentValue = stats.level ?? 0;
          break;
        case 'points':
          currentValue = stats.points ?? 0;
          break;
        case 'totalClaimed':
          currentValue = stats.totalClaimed ?? 0;
          break;
        case 'tasksCompleted':
          currentValue = stats.tasksCompleted ?? 0;
          break;
        case 'fastResponse':
          currentValue = stats.fastResponse ?? 0;
          break;
        case 'categoriesCompleted':
          currentValue = stats.categoriesCompleted ?? 0;
          break;
        case 'rating':
          currentValue = stats.rating ?? 0;
          break;
        case 'streak':
          currentValue = stats.streak ?? 0;
          break;
      }

      if (currentValue >= def.requirement.target) {
        newlyUnlocked.push(def.id);
        pointsToAdd += def.points;
        unlockedAchievements.push(def);
      }
    }

    if (newlyUnlocked.length > 0) {
      // Update achievements in database
      const updates = newlyUnlocked.map(id => ({
        id,
        unlockedAt: now
      }));

      // For achievements that are already in array but not unlocked, update them
      // For new achievements, push them
      for (const update of updates) {
        const existingAchievement = (user.achievements || []).find((a: any) => a.id === update.id);
        
        if (existingAchievement) {
          // Update existing achievement
          await col.updateOne(
            { _id: new ObjectId(userId), "achievements.id": update.id },
            { $set: { "achievements.$.unlockedAt": update.unlockedAt } } as any
          );
        } else {
          // Add new achievement
          await col.updateOne(
            { _id: new ObjectId(userId) },
            { $push: { achievements: update } } as any
          );
        }
      }

      // Update points in stats
      await col.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $inc: { "stats.points": pointsToAdd },
          $set: { updatedAt: now }
        } as any
      );

      // Send notifications for each unlocked achievement
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