
// ─────────────────────────────────────────────────────────────────────────────
// __tests__/components/ReviewModal.test.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewModal } from '@/app/(dashboard)/admin/issues/components/reviewModal';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));
jest.mock('lucide-react', () => ({
  XCircleIcon: () => <svg data-testid="x-icon" />,
}));

const MOCK_ISSUE = {
  id: 'issue-1', title: 'Broken Street Light', description: 'Light not working',
  category: 'infrastructure', priority: 'high', status: 'pending_review',
  location: 'Main Street', createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(), upvotes: 3, commentsCount: 2,
  resolutionNotes: 'Fixed the light bulb', resolutionProof: [],
};

const mockOnClose  = jest.fn();
const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

beforeEach(() => jest.clearAllMocks());

describe('ReviewModal', () => {

  test('renders nothing when isOpen is false', () => {
    render(
      <ReviewModal isOpen={false} onClose={mockOnClose} onSubmit={mockOnSubmit}
        issue={MOCK_ISSUE} isSubmitting={false} />
    );
    expect(screen.queryByText(/review resolution/i)).not.toBeInTheDocument();
  });

  test('renders nothing when issue is null', () => {
    render(
      <ReviewModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit}
        issue={null} isSubmitting={false} />
    );
    expect(screen.queryByText(/review resolution/i)).not.toBeInTheDocument();
  });

  test('renders modal when isOpen and issue are provided', () => {
    render(
      <ReviewModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit}
        issue={MOCK_ISSUE} isSubmitting={false} />
    );
    expect(screen.getByText(/review resolution/i)).toBeInTheDocument();
  });

  test('shows issue title and description', () => {
    render(
      <ReviewModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit}
        issue={MOCK_ISSUE} isSubmitting={false} />
    );
    expect(screen.getByText('Broken Street Light')).toBeInTheDocument();
    expect(screen.getByText('Light not working')).toBeInTheDocument();
  });

  test('shows resolution notes from volunteer', () => {
    render(
      <ReviewModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit}
        issue={MOCK_ISSUE} isSubmitting={false} />
    );
    expect(screen.getByText("Volunteer's Resolution Notes")).toBeInTheDocument();
    expect(screen.getByText('Fixed the light bulb')).toBeInTheDocument();
  });

  test('defaults to approve action', () => {
    render(
      <ReviewModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit}
        issue={MOCK_ISSUE} isSubmitting={false} />
    );
    const approveRadio = screen.getByDisplayValue('approve') as HTMLInputElement;
    expect(approveRadio.checked).toBe(true);
  });

  test('shows Approve & Resolve button by default', () => {
    render(
      <ReviewModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit}
        issue={MOCK_ISSUE} isSubmitting={false} />
    );
    expect(screen.getByRole('button', { name: /approve & resolve/i })).toBeInTheDocument();
  });

  test('switching to reject shows rejection reason textarea', async () => {
    const user = userEvent.setup();
    render(
      <ReviewModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit}
        issue={MOCK_ISSUE} isSubmitting={false} />
    );
    await user.click(screen.getByDisplayValue('reject'));
    expect(screen.getByPlaceholderText(/why is this being rejected/i)).toBeInTheDocument();
  });

  test('reject button is disabled when no rejection reason provided', async () => {
    const user = userEvent.setup();
    render(
      <ReviewModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit}
        issue={MOCK_ISSUE} isSubmitting={false} />
    );
    await user.click(screen.getByDisplayValue('reject'));
    expect(screen.getByRole('button', { name: /reject & send back/i })).toBeDisabled();
  });

  test('reject button is enabled when rejection reason is filled', async () => {
    const user = userEvent.setup();
    render(
      <ReviewModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit}
        issue={MOCK_ISSUE} isSubmitting={false} />
    );
    await user.click(screen.getByDisplayValue('reject'));
    await user.type(screen.getByPlaceholderText(/why is this being rejected/i), 'Not complete');
    expect(screen.getByRole('button', { name: /reject & send back/i })).not.toBeDisabled();
  });

  test('calls onSubmit with approved=true and review notes when approved', async () => {
    const user = userEvent.setup();
    render(
      <ReviewModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit}
        issue={MOCK_ISSUE} isSubmitting={false} />
    );
    await user.type(screen.getByPlaceholderText(/add your review notes/i), 'Looks good!');
    await user.click(screen.getByRole('button', { name: /approve & resolve/i }));
    expect(mockOnSubmit).toHaveBeenCalledWith(true, 'Looks good!', '');
  });

  test('calls onSubmit with approved=false and rejection reason when rejected', async () => {
    const user = userEvent.setup();
    render(
      <ReviewModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit}
        issue={MOCK_ISSUE} isSubmitting={false} />
    );
    await user.click(screen.getByDisplayValue('reject'));
    await user.type(screen.getByPlaceholderText(/why is this being rejected/i), 'Needs more work');
    await user.click(screen.getByRole('button', { name: /reject & send back/i }));
    expect(mockOnSubmit).toHaveBeenCalledWith(false, '', 'Needs more work');
  });

  test('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ReviewModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit}
        issue={MOCK_ISSUE} isSubmitting={false} />
    );
    await user.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('shows Submitting... and disables button while submitting', () => {
    render(
      <ReviewModal isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit}
        issue={MOCK_ISSUE} isSubmitting={true} />
    );
    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
  });
});