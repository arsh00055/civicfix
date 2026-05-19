 jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('@/features/auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('@/lib/services/api/endpoints', () => ({
  issuesAPI: { getIssue: jest.fn(), voteIssue: jest.fn() },
}));
jest.mock('@/lib/services/notificationService', () => {
  const mock = {
    showSuccessNotification: jest.fn(),
    showInfoNotification:    jest.fn(),
    showErrorNotification:   jest.fn(),
  };
  return {
    __esModule: true,
    default: mock,
  };
});

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { issuesAPI } from '@/lib/services/api/endpoints';
import notificationService from '@/lib/services/notificationService';
import VoteButton from '@/components/issues/IssueActions/VoteButton';
 
const mockPush = jest.fn();
const ISSUE_ID = 'issue-abc-123';
 
beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (useAuth as jest.Mock).mockReturnValue({
    isAuthenticated: true,
    user: { id: 'user-1', role: 'citizen' },
  });
  // Default: issue has no voters → user hasn't voted
  (issuesAPI.getIssue as jest.Mock).mockResolvedValue({
    data: { voters: [] },
  });
});
 
describe('VoteButton', () => {
 
  describe('rendering', () => {
    test('renders vote button with initial vote count', async () => {
      render(<VoteButton issueId={ISSUE_ID} initialVotes={5} />);
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
      expect(screen.getByText('5')).toBeInTheDocument();
    });
 
    test('hides count when showCount is false', async () => {
      render(<VoteButton issueId={ISSUE_ID} initialVotes={5} showCount={false} />);
      await waitFor(() => screen.getByRole('button'));
      expect(screen.queryByText('5')).not.toBeInTheDocument();
    });
 
    test('shows "Vote for this issue" aria-label when not voted', async () => {
      render(<VoteButton issueId={ISSUE_ID} initialVotes={0} initialHasVoted={false} />);
      await waitFor(() =>
        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Vote for this issue')
      );
    });
 
    test('shows "Remove vote" aria-label when already voted', async () => {
      render(<VoteButton issueId={ISSUE_ID} initialVotes={3} initialHasVoted={true} />);
      // initialHasVoted skips the API check, so initialCheckDone is true immediately
      await waitFor(() =>
        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Remove vote')
      );
    });
 
    test('button is disabled until initial vote check is complete', () => {
      // Make getIssue never resolve so check stays pending
      (issuesAPI.getIssue as jest.Mock).mockImplementation(() => new Promise(() => {}));
      render(<VoteButton issueId={ISSUE_ID} initialVotes={0} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
 
  describe('initial vote status check', () => {
    test('checks vote status from API when user is logged in', async () => {
      (issuesAPI.getIssue as jest.Mock).mockResolvedValue({
        data: { voters: ['user-1'] }, // user has voted
      });
      render(<VoteButton issueId={ISSUE_ID} initialVotes={1} />);
 
      await waitFor(() =>
        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Remove vote')
      );
      expect(issuesAPI.getIssue).toHaveBeenCalledWith(ISSUE_ID);
    });
 
    test('skips API check when initialHasVoted is provided', async () => {
      render(<VoteButton issueId={ISSUE_ID} initialVotes={2} initialHasVoted={true} />);
      await waitFor(() => screen.getByRole('button'));
      // Should not call getIssue since initialHasVoted skips the check
      expect(issuesAPI.getIssue).not.toHaveBeenCalled();
    });
 
    test('skips API check when user is not logged in', async () => {
      (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false, user: null });
      render(<VoteButton issueId={ISSUE_ID} initialVotes={0} />);
      await waitFor(() => screen.getByRole('button'));
      expect(issuesAPI.getIssue).not.toHaveBeenCalled();
    });
  });
 
  describe('voting', () => {
    test('redirects to login when unauthenticated user clicks vote', async () => {
      (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false, user: null });
      const user = userEvent.setup();
      render(<VoteButton issueId={ISSUE_ID} initialVotes={0} initialHasVoted={false} />);
      await waitFor(() => screen.getByRole('button'));
 
      await user.click(screen.getByRole('button'));
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/login'));
    });
 
    test('increments vote count on successful vote', async () => {
      (issuesAPI.voteIssue as jest.Mock).mockResolvedValue({
        data: { voted: true, upvotes: 6 },
      });
      const user = userEvent.setup();
      render(<VoteButton issueId={ISSUE_ID} initialVotes={5} initialHasVoted={false} />);
 
      await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled());
      await user.click(screen.getByRole('button'));
 
      await waitFor(() => expect(screen.getByText('6')).toBeInTheDocument());
    });
 
    test('decrements vote count when removing vote', async () => {
      (issuesAPI.voteIssue as jest.Mock).mockResolvedValue({
        data: { voted: false, upvotes: 4 },
      });
      const user = userEvent.setup();
      render(<VoteButton issueId={ISSUE_ID} initialVotes={5} initialHasVoted={true} />);
 
      await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled());
      await user.click(screen.getByRole('button'));
 
      await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    });
 
    test('calls onVote callback with correct args', async () => {
      (issuesAPI.voteIssue as jest.Mock).mockResolvedValue({
        data: { voted: true, upvotes: 1 },
      });
      const onVote = jest.fn();
      const user = userEvent.setup();
      render(<VoteButton issueId={ISSUE_ID} initialVotes={0} initialHasVoted={false} onVote={onVote} />);
 
      await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled());
      await user.click(screen.getByRole('button'));
 
      await waitFor(() => expect(onVote).toHaveBeenCalledWith(ISSUE_ID, true));
    });
 
    test('shows success notification when vote is added', async () => {
      (issuesAPI.voteIssue as jest.Mock).mockResolvedValue({
        data: { voted: true, upvotes: 1 },
      });
      const user = userEvent.setup();
      render(<VoteButton issueId={ISSUE_ID} initialVotes={0} initialHasVoted={false} />);
 
      await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled());
      await user.click(screen.getByRole('button'));
 
      await waitFor(() =>
        expect(notificationService.showSuccessNotification).toHaveBeenCalledWith('Vote added!')
      );
    });
 
    test('shows info notification when vote is removed', async () => {
      (issuesAPI.voteIssue as jest.Mock).mockResolvedValue({
        data: { voted: false, upvotes: 0 },
      });
      const user = userEvent.setup();
      render(<VoteButton issueId={ISSUE_ID} initialVotes={1} initialHasVoted={true} />);
 
      await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled());
      await user.click(screen.getByRole('button'));
 
      await waitFor(() =>
        expect(notificationService.showInfoNotification).toHaveBeenCalledWith('Vote removed')
      );
    });
 
    test('shows error notification when vote fails', async () => {
      (issuesAPI.voteIssue as jest.Mock).mockRejectedValue(new Error('Network error'));
      const user = userEvent.setup();
      render(<VoteButton issueId={ISSUE_ID} initialVotes={0} initialHasVoted={false} />);
 
      await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled());
      await user.click(screen.getByRole('button'));
 
      await waitFor(() =>
        expect(notificationService.showErrorNotification).toHaveBeenCalledWith(
          'Failed to vote. Please try again.'
        )
      );
    });
  });
});