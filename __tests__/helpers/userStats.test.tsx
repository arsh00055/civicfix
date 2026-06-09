import { updateUserStatsAndCheckAchievements } from '@/lib/helpers/userStats.helper';
import { mockDb, mockFindOne, mockUpdateOne } from '../db/mongodb';
jest.mock('@/lib/services/achievementService', () => ({
    checkAndAwardAchievements: jest.fn().mockResolvedValue({ newlyUnlocked: [], pointsAwarded: 0 }),
  }));
import { checkAndAwardAchievements } from '@/lib/services/achievementService';
 
describe('updateUserStatsAndCheckAchievements', () => {
  const CITIZEN_ID = '507f1f77bcf86cd799439020';
 
  beforeEach(() => {
    mockFindOne.mockResolvedValue({
      stats: { totalReports: 1, totalVotes: 0, totalComments: 0, resolvedReports: 0, level: 1, points: 10 },
    });
  });
 
  test('increments the correct stats field in the citizen collection', async () => {
    mockUpdateOne.mockClear();
    await updateUserStatsAndCheckAchievements(CITIZEN_ID, 'citizen', { totalReports: 1 });
 
    const updateArg = mockUpdateOne.mock.calls[0][1];
    expect(updateArg.$inc['stats.totalReports']).toBe(1);
  });
 
  test('increments multiple stats at once', async () => {
    mockUpdateOne.mockClear();
    await updateUserStatsAndCheckAchievements(CITIZEN_ID, 'citizen', {
      totalReports: 1,
      points: 10,
    });
 
    const updateArg = mockUpdateOne.mock.calls[0][1];
    expect(updateArg.$inc['stats.totalReports']).toBe(1);
    expect(updateArg.$inc['stats.points']).toBe(10);
  });
 
  test('uses volunteers collection for volunteer role', async () => {
    mockUpdateOne.mockClear();
    await updateUserStatsAndCheckAchievements(CITIZEN_ID, 'volunteer', { totalClaimed: 1 });
 
    // db.collection should be called with 'volunteers'
    const collectionCalls = mockDb.collection.mock.calls.map((c: any[]) => c[0]);
    expect(collectionCalls).toContain('volunteers');
  });
 
  test('uses citizens collection for citizen role', async () => {
    mockUpdateOne.mockClear();
    await updateUserStatsAndCheckAchievements(CITIZEN_ID, 'citizen', { totalReports: 1 });
 
    const collectionCalls = mockDb.collection.mock.calls.map((c: any[]) => c[0]);
    expect(collectionCalls).toContain('citizens');
  });
 
  test('calls checkAndAwardAchievements with updated stats', async () => {
    await updateUserStatsAndCheckAchievements(CITIZEN_ID, 'citizen', { totalReports: 1 });
 
    expect(checkAndAwardAchievements).toHaveBeenCalledWith(
      CITIZEN_ID,
      'citizen',
      expect.objectContaining({ totalReports: 1 })
    );
  });
 
  test('sets updatedAt timestamp on the record', async () => {
    mockUpdateOne.mockClear();
    await updateUserStatsAndCheckAchievements(CITIZEN_ID, 'citizen', { totalReports: 1 });
 
    const updateArg = mockUpdateOne.mock.calls[0][1];
    expect(updateArg.$set.updatedAt).toBeDefined();
  });
});