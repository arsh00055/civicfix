import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { checkAndAwardAchievements } from "@/lib/services/achievementService";

export async function updateUserStatsAndCheckAchievements(
  userId: string,
  role: 'citizen' | 'volunteer',
  updates: Record<string, number>
) {
  const { db } = await connectToDatabase();
  const col = db.collection(role === 'volunteer' ? 'volunteers' : 'citizens');

  const inc: Record<string, any> = {};
  for (const [k, v] of Object.entries(updates)) inc[`stats.${k}`] = v;

  await col.updateOne(
    { _id: new ObjectId(userId) },
    { $inc: inc, $set: { updatedAt: new Date().toISOString() } }
  );

  const updatedUser = await col.findOne(
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