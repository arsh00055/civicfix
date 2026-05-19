import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { commentsAPI } from '@/lib/services/api/endpoints';
import CommentSection from '@/app/issues/[id]/components/CommentSection';
import { Comment } from '@/types/issue.types';
 
jest.mock('@/features/auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('@/lib/services/api/endpoints', () => ({
  commentsAPI: {
    getComments: jest.fn(),
    addComment:  jest.fn(),
  },
}));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));
jest.mock('@/lib/utils/helpers/formatters', () => ({
  formatRelativeTime: () => '2 hours ago',
}));
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
 
const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    issueId: 'issue_123',
    userId: 'u1',
    user: {
      id: 'u1',
      name: 'Jaspreet',
      avatar: 'https://example.com/avatars/jaspreet.jpg',
      role: 'citizen',
    },
    text: 'Pothole on Main Street causing traffic delays',
    attachments: ['https://example.com/photos/intersection.jpg', 'https://example.com/photos/traffic.jpg'],
    parentId: undefined,
    replies: [],
    upvotes: 15,
    isEdited: false,
    isPinned: true,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },
];
 
beforeEach(() => {
  jest.clearAllMocks();
  (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
  (commentsAPI.getComments as jest.Mock).mockResolvedValue({ data: MOCK_COMMENTS });
});
 
describe('CommentSection', () => {
 
  describe('rendering', () => {
    test('shows comment count in heading', async () => {
      render(<CommentSection issueId="issue-1" initialComments={MOCK_COMMENTS} />);
      expect(screen.getByText(/comments \(1\)/i)).toBeInTheDocument();
    });
 
    test('renders existing comments', () => {
      render(<CommentSection issueId="issue-1" initialComments={MOCK_COMMENTS} />);
      expect(screen.getByText(/pothole on main street/i)).toBeInTheDocument();
      expect(screen.getByText('Jaspreet')).toBeInTheDocument();
    });
 
    test('shows empty state when no comments', () => {
      render(<CommentSection issueId="issue-1" initialComments={[]} />);
      // fetchComments will be called — but while loading, show spinner
      // after load with empty result, show empty state
    });
 
    test('shows login prompt when unauthenticated', async () => {
      (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
      // Give it initial comments so it skips the fetch/spinner
      render(<CommentSection issueId="issue-1" initialComments={MOCK_COMMENTS} />);
      
      await waitFor(() => {
        expect(screen.getByText(/log in/i)).toBeInTheDocument();
      });
      expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
    });
 
    test('shows textarea and submit button when authenticated', () => {
      render(<CommentSection issueId="issue-1" initialComments={MOCK_COMMENTS} />);
      expect(screen.getByPlaceholderText(/add a comment/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /post comment/i })).toBeInTheDocument();
    });
 
    test('submit button is disabled when textarea is empty', () => {
      render(<CommentSection issueId="issue-1" initialComments={MOCK_COMMENTS} />);
      expect(screen.getByRole('button', { name: /post comment/i })).toBeDisabled();
    });
  });
 
  describe('fetching comments', () => {
    test('fetches comments on mount when no initial comments given', async () => {
      (commentsAPI.getComments as jest.Mock).mockResolvedValue({ data: MOCK_COMMENTS });
      render(<CommentSection issueId="issue-1" />);
      await waitFor(() => expect(commentsAPI.getComments).toHaveBeenCalledWith('issue-1'));
    });
 
    test('does not fetch when initial comments are provided', () => {
      render(<CommentSection issueId="issue-1" initialComments={MOCK_COMMENTS} />);
      expect(commentsAPI.getComments).not.toHaveBeenCalled();
    });
  });
 
  describe('posting a comment', () => {
    test('enables submit button when textarea has content', async () => {
      const user = userEvent.setup();
      render(<CommentSection issueId="issue-1" initialComments={MOCK_COMMENTS} />);
 
      await user.type(screen.getByPlaceholderText(/add a comment/i), 'My new comment');
      expect(screen.getByRole('button', { name: /post comment/i })).not.toBeDisabled();
    });
 
    test('adds new comment to list on successful submit', async () => {
      const newComment = {
        id: 'c2',
        userId: 'u1',
        user: { id: 'u1', name: 'Jaspreet', role: 'citizen', avatar: null },
        text: 'My new comment',
        upvotes: 0,
        isEdited: false,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (commentsAPI.addComment as jest.Mock).mockResolvedValue({ data: newComment });
 
      const user = userEvent.setup();
      render(<CommentSection issueId="issue-1" initialComments={MOCK_COMMENTS} />);
 
      await user.type(screen.getByPlaceholderText(/add a comment/i), 'My new comment');
      await user.click(screen.getByRole('button', { name: /post comment/i }));
 
      await waitFor(() => expect(screen.getByText('My new comment')).toBeInTheDocument());
    });
 
    test('clears textarea after successful submit', async () => {
      (commentsAPI.addComment as jest.Mock).mockResolvedValue({
        data: { id: 'c2', user: { name: 'J' }, text: 'hi', createdAt: new Date().toISOString() },
      });
      const user = userEvent.setup();
      render(<CommentSection issueId="issue-1" initialComments={MOCK_COMMENTS} />);
 
      const textarea = screen.getByPlaceholderText(/add a comment/i);
      await user.type(textarea, 'hello');
      await user.click(screen.getByRole('button', { name: /post comment/i }));
 
      await waitFor(() => expect(textarea).toHaveValue(''));
    });
 
    test('calls commentsAPI.addComment with correct args', async () => {
      (commentsAPI.addComment as jest.Mock).mockResolvedValue({
        data: { id: 'c2', user: { name: 'J' }, text: 'Great!', createdAt: new Date().toISOString() },
      });
      const user = userEvent.setup();
      render(<CommentSection issueId="issue-1" initialComments={MOCK_COMMENTS} />);
 
      await user.type(screen.getByPlaceholderText(/add a comment/i), 'Great!');
      await user.click(screen.getByRole('button', { name: /post comment/i }));
 
      await waitFor(() =>
        expect(commentsAPI.addComment).toHaveBeenCalledWith('issue-1', { text: 'Great!' })
      );
    });
  });
});