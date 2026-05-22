/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor, act } from '@testing-library/react';
import { issuesAPI as issAPI, commentsAPI as cmtAPI } from '@/lib/services/api/endpoints';
import { useAuth as useAuthHook } from '@/features/auth/hooks/useAuth';
// ✅ FIX: Sahi path — @/hooks/api/useIssues (lib nahi, hooks folder)
import { useIssues } from '@/hooks/api/useIssues';

jest.mock('@/features/auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('@/lib/services/api/endpoints', () => ({
  issuesAPI: {
    getIssues:    jest.fn(),
    createIssue:  jest.fn(),
    updateIssue:  jest.fn(),
    deleteIssue:  jest.fn(),
    voteIssue:    jest.fn(),
    claimIssue:   jest.fn(),
    getMyReports: jest.fn(),
    getIssue:     jest.fn(),
  },
  commentsAPI: {
    addComment:  jest.fn(),
    getComments: jest.fn(),
  },
}));

const MOCK_ISSUE = {
  id: 'issue-1', title: 'Pothole', description: 'Big hole',
  status: 'reported' as const, priority: 'high' as const,
  category: 'infrastructure', location: 'Main St',
  upvotes: 5, voters: ['user-1'],
  latitude: 0, longitude: 0, images: [], views: 0,
  commentsCount: 0, reporterId: 'user-1',
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  reportedAt: new Date().toISOString(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (useAuthHook as jest.Mock).mockReturnValue({ user: { id: 'user-1', role: 'citizen' } });
  (issAPI.getIssues as jest.Mock).mockResolvedValue({ data: { issues: [MOCK_ISSUE], total: 1 } });
});

describe('useIssues', () => {

  test('starts in loading state', () => {
    (issAPI.getIssues as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useIssues());
    expect(result.current.loading).toBe(true);
  });

  test('fetches issues on mount when autoFetch is true', async () => {
    const { result } = renderHook(() => useIssues());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.issues).toHaveLength(1);
    expect(result.current.issues[0].title).toBe('Pothole');
  });

  test('does not fetch when autoFetch is false', async () => {
    renderHook(() => useIssues({ autoFetch: false }));
    await waitFor(() => expect(issAPI.getIssues).not.toHaveBeenCalled());
  });

  test('sets error when fetch fails', async () => {
    (issAPI.getIssues as jest.Mock).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useIssues());
    await waitFor(() => expect(result.current.error).toBe('Network error'));
  });

  test('hasUserVoted returns true when user is in voters array', async () => {
    const { result } = renderHook(() => useIssues());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasUserVoted('issue-1')).toBe(true);
  });

  test('hasUserVoted returns false when user is not in voters array', async () => {
    (issAPI.getIssues as jest.Mock).mockResolvedValue({
      data: { issues: [{ ...MOCK_ISSUE, voters: ['other-user'] }], total: 1 }
    });
    const { result } = renderHook(() => useIssues());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasUserVoted('issue-1')).toBe(false);
  });

  test('getIssuesByStatus filters correctly', async () => {
    const resolved = { ...MOCK_ISSUE, id: 'issue-2', status: 'resolved' as const };
    (issAPI.getIssues as jest.Mock).mockResolvedValue({
      data: { issues: [MOCK_ISSUE, resolved], total: 2 }
    });
    const { result } = renderHook(() => useIssues());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const reported = result.current.getIssuesByStatus('reported');
    expect(reported).toHaveLength(1);
    expect(reported[0].id).toBe('issue-1');
  });

  test('getIssuesByCategory filters correctly', async () => {
    const safety = { ...MOCK_ISSUE, id: 'issue-3', category: 'safety' };
    (issAPI.getIssues as jest.Mock).mockResolvedValue({
      data: { issues: [MOCK_ISSUE, safety], total: 2 }
    });
    const { result } = renderHook(() => useIssues());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.getIssuesByCategory('safety')).toHaveLength(1);
    expect(result.current.getIssuesByCategory('infrastructure')).toHaveLength(1);
  });

  test('voteIssue updates issue upvotes in state', async () => {
    (issAPI.voteIssue as jest.Mock).mockResolvedValue({
      data: { voted: true, upvotes: 6 }
    });
    const { result } = renderHook(() => useIssues());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.voteIssue('issue-1');
    });

    expect(result.current.getVoteCount('issue-1')).toBe(6);
  });

  test('deleteIssue removes issue from state', async () => {
    (issAPI.deleteIssue as jest.Mock).mockResolvedValue({});
    const { result } = renderHook(() => useIssues());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteIssue('issue-1');
    });

    expect(result.current.issues).toHaveLength(0);
  });
});
