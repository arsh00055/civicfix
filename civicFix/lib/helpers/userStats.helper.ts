import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { checkAndAwardAchievements } from "@/lib/services/achievementService";

export async function updateUserStatsAndCheckAchievements(
  userId: string,
  role: 'citizen' | 'volunteer',
  updates: Record<string, number>
) {
  const { db } = await connectToDatabase();
  const citizens = db.collection("citizens");

  const updateObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(updates)) {
    updateObj[`stats.${key}`] = value;
  }

  await citizens.updateOne(
    { _id: new ObjectId(userId) },
    { $inc: updateObj, $set: { updatedAt: new Date().toISOString() } }
  );

  const updatedUser = await citizens.findOne(
    { _id: new ObjectId(userId) },
    { projection: { stats: 1 } }
  );

  if (updatedUser?.stats) {
    await checkAndAwardAchievements(userId, role, {
      totalReports: updatedUser.stats.totalReports,
      totalVotes: updatedUser.stats.totalVotes,
      totalComments: updatedUser.stats.totalComments,
      resolvedReports: updatedUser.stats.resolvedReports,
      level: updatedUser.stats.level,
      points: updatedUser.stats.points,
    });
  }
}