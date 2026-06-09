import {
    unwrapArray,
    formatRelativeTime,
    formatNotifications,
    sortAndSliceByDate,
    extractUserFromNotification,
  } from '@/lib/helpers/dashboardUtils';
   
  describe('dashboardUtils', () => {
   
    describe('unwrapArray', () => {
      test('returns raw array when input is already an array', () => {
        const arr = [1, 2, 3];
        expect(unwrapArray(arr)).toEqual([1, 2, 3]);
      });
   
      test('unwraps by first matching key', () => {
        const data = { issues: [{ id: 'i1' }], total: 1 };
        expect(unwrapArray(data, 'issues')).toEqual([{ id: 'i1' }]);
      });
   
      test('tries keys in order and uses first match', () => {
        const data = { reports: [{ id: 'r1' }], issues: [{ id: 'i1' }] };
        expect(unwrapArray(data, 'issues', 'reports')).toEqual([{ id: 'i1' }]);
      });
   
      test('falls back to data key when no named key matches', () => {
        const data = { data: [{ id: 'd1' }] };
        expect(unwrapArray(data, 'issues')).toEqual([{ id: 'd1' }]);
      });
   
      test('returns empty array for null input', () => {
        expect(unwrapArray(null, 'issues')).toEqual([]);
      });
   
      test('returns empty array for undefined input', () => {
        expect(unwrapArray(undefined, 'issues')).toEqual([]);
      });
   
      test('returns empty array when key not found and no array', () => {
        expect(unwrapArray({ total: 5 }, 'issues')).toEqual([]);
      });
    });
   
    describe('formatRelativeTime', () => {
      test('returns "Just now" for empty string', () => {
        expect(formatRelativeTime('')).toBe('Just now');
      });
   
      test('returns "Just now" for less than 1 minute ago', () => {
        const thirtySecsAgo = new Date(Date.now() - 30_000).toISOString();
        expect(formatRelativeTime(thirtySecsAgo)).toBe('Just now');
      });
   
      test('returns "X min ago" for minutes', () => {
        const fiveMinsAgo = new Date(Date.now() - 5 * 60_000).toISOString();
        expect(formatRelativeTime(fiveMinsAgo)).toBe('5 min ago');
      });
   
      test('returns "1 hour ago" for 1 hour', () => {
        const oneHourAgo = new Date(Date.now() - 61 * 60_000).toISOString();
        expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
      });
   
      test('returns "X hours ago" for multiple hours', () => {
        const threeHoursAgo = new Date(Date.now() - 3 * 3600_000).toISOString();
        expect(formatRelativeTime(threeHoursAgo)).toBe('3 hours ago');
      });
   
      test('returns "1 day ago" for 1 day', () => {
        const oneDayAgo = new Date(Date.now() - 25 * 3600_000).toISOString();
        expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');
      });
   
      test('returns "X days ago" for multiple days', () => {
        const threeDaysAgo = new Date(Date.now() - 3 * 86400_000).toISOString();
        expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
      });
   
      test('returns localeDateString for dates older than 7 days', () => {
        const tenDaysAgo = new Date(Date.now() - 10 * 86400_000);
        const result = formatRelativeTime(tenDaysAgo.toISOString());
        expect(result).toBe(tenDaysAgo.toLocaleDateString());
      });
    });
   
    describe('formatNotifications', () => {
      test('returns welcome notification when array is empty', () => {
        const result = formatNotifications([], 'Welcome!');
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('welcome');
        expect(result[0].title).toBe('Welcome!');
      });
   
      test('returns welcome notification when input is not an array', () => {
        const result = formatNotifications(null as any, 'Hello!');
        expect(result[0].type).toBe('welcome');
      });
   
      test('maps notifications with correct shape', () => {
        const raw = [{
          id:        'n1',
          type:      'issue_update',
          title:     'Issue Updated',
          message:   'Your issue was updated.',
          createdAt: new Date().toISOString(),
          metadata:  { issueId: 'i1' },
        }];
   
        const result = formatNotifications(raw);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('n1');
        expect(result[0].type).toBe('issue_update');
        expect(result[0].title).toBe('Issue Updated');
        expect(result[0].message).toBe('Your issue was updated.');
        expect(result[0].time).toBeDefined();
        expect(result[0].metadata).toEqual({ issueId: 'i1' });
      });
   
      test('uses _id as fallback when id is missing', () => {
        const raw = [{ _id: 'mongo-id', type: 'welcome', title: 'Hi', message: 'Hello', createdAt: new Date().toISOString() }];
        const result = formatNotifications(raw);
        expect(result[0].id).toBe('mongo-id');
      });
    });
   
    describe('sortAndSliceByDate', () => {
      const items = [
        { name: 'oldest', createdAt: '2024-01-01T00:00:00.000Z' },
        { name: 'newest', createdAt: '2024-03-01T00:00:00.000Z' },
        { name: 'middle', createdAt: '2024-02-01T00:00:00.000Z' },
      ];
   
      test('sorts by date newest first', () => {
        const result = sortAndSliceByDate(items, 'createdAt', 10);
        expect(result[0].name).toBe('newest');
        expect(result[1].name).toBe('middle');
        expect(result[2].name).toBe('oldest');
      });
   
      test('slices to the limit', () => {
        const result = sortAndSliceByDate(items, 'createdAt', 2);
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('newest');
      });
   
      test('does not mutate the original array', () => {
        const original = [...items];
        sortAndSliceByDate(items, 'createdAt', 10);
        expect(items[0].name).toBe('oldest'); // original order preserved
      });
   
      test('returns empty array for empty input', () => {
        expect(sortAndSliceByDate([], 'createdAt', 10)).toEqual([]);
      });
    });
   
    describe('extractUserFromNotification', () => {
      test('extracts userName from metadata', () => {
        expect(extractUserFromNotification({ metadata: { userName: 'Jaspreet' } })).toBe('Jaspreet');
      });
   
      test('extracts reporterName when userName missing', () => {
        expect(extractUserFromNotification({ metadata: { reporterName: 'Arshdeep' } })).toBe('Arshdeep');
      });
   
      test('extracts volunteerName as fallback', () => {
        expect(extractUserFromNotification({ metadata: { volunteerName: 'Vol' } })).toBe('Vol');
      });
   
      test('returns System when no user metadata', () => {
        expect(extractUserFromNotification({ metadata: {} })).toBe('System');
      });
   
      test('returns System when metadata is missing', () => {
        expect(extractUserFromNotification({})).toBe('System');
      });
    });
  });