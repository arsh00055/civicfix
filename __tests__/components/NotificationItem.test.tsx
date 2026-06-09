// __tests__/components/NotificationItem.test.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Fixed to match actual NotificationItem component:
//   - onClick(notificationId: string) — NOT onClick(notification)
//   - NO onMarkRead prop — component only has onClick
//   - Component navigates internally via useRouter
//   - Unread indicator is a blue dot div, not an aria role
// ─────────────────────────────────────────────────────────────────────────────

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

// formatRelativeTime is used inside the component
jest.mock('@/lib/utils/helpers/formatters', () => ({
  formatRelativeTime: jest.fn().mockReturnValue('1 hour ago'),
}));

import NotificationItem from '@/app/notifications/components/NotificationItem';

const mockPush = jest.fn();

// Base notification matching the Notification type from notification.types.ts
const BASE_NOTIFICATION = {
  id:        'n1',
  type:      'issue_update' as const,
  title:     'Issue Assigned',
  message:   'A volunteer has been assigned to your issue.',
  read:      false,
  seen:      false,
  priority:  'medium' as const,
  category:  'issue' as const,
  timestamp: new Date(Date.now() - 3600000).toISOString(),
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  updatedAt: new Date(Date.now() - 3600000).toISOString(),
};

const mockOnClick = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

describe('NotificationItem', () => {

  // ── Rendering ──────────────────────────────────────────────────────────────
  describe('rendering', () => {

    test('renders notification title', () => {
      render(<NotificationItem notification={BASE_NOTIFICATION} onClick={mockOnClick} />);
      expect(screen.getByText('Issue Assigned')).toBeInTheDocument();
    });

    test('renders notification message', () => {
      render(<NotificationItem notification={BASE_NOTIFICATION} onClick={mockOnClick} />);
      expect(
        screen.getByText('A volunteer has been assigned to your issue.')
      ).toBeInTheDocument();
    });

    test('renders relative time from formatRelativeTime', () => {
      render(<NotificationItem notification={BASE_NOTIFICATION} onClick={mockOnClick} />);
      expect(screen.getByText('1 hour ago')).toBeInTheDocument();
    });

    test('shows unread blue dot indicator when notification is unread', () => {
      render(
        <NotificationItem
          notification={{ ...BASE_NOTIFICATION, read: false }}
          onClick={mockOnClick}
        />
      );
      // The component renders a blue dot div for unread notifications
      // It has class bg-blue-500 rounded-full
      const container = screen.getByText('Issue Assigned').closest('div[class*="bg-blue"]')
        ?? document.querySelector('.bg-blue-500.rounded-full');
      expect(container).toBeTruthy();
    });

    test('does not show blue dot when notification is already read', () => {
      render(
        <NotificationItem
          notification={{ ...BASE_NOTIFICATION, read: true }}
          onClick={mockOnClick}
        />
      );
      // No blue dot — the div.w-2.h-2.bg-blue-500.rounded-full should not exist
      const dot = document.querySelector('.bg-blue-500.rounded-full');
      expect(dot).toBeNull();
    });

    test('unread notification has blue background (bg-blue-50)', () => {
      const { container } = render(
        <NotificationItem
          notification={{ ...BASE_NOTIFICATION, read: false }}
          onClick={mockOnClick}
        />
      );
      // Unread items have bg-blue-50 class
      expect(container.firstChild).toHaveClass('bg-blue-50');
    });

    test('read notification has white background (bg-white)', () => {
      const { container } = render(
        <NotificationItem
          notification={{ ...BASE_NOTIFICATION, read: true }}
          onClick={mockOnClick}
        />
      );
      expect(container.firstChild).toHaveClass('bg-white');
    });

    test('shows correct icon for issue_update type (🔔)', () => {
      render(
        <NotificationItem
          notification={{ ...BASE_NOTIFICATION, type: 'issue_update' }}
          onClick={mockOnClick}
        />
      );
      expect(screen.getByText('🔔')).toBeInTheDocument();
    });

    test('shows correct icon for achievement_unlocked type (🏆)', () => {
      render(
        <NotificationItem
          notification={{
            ...BASE_NOTIFICATION,
            type: 'achievement_unlocked',
            title: 'Badge Earned!',
            message: 'You earned the First Reporter badge.',
          }}
          onClick={mockOnClick}
        />
      );
      expect(screen.getByText('🏆')).toBeInTheDocument();
      expect(screen.getByText('Badge Earned!')).toBeInTheDocument();
    });

    test('shows correct icon for new_comment type (💬)', () => {
      render(
        <NotificationItem
          notification={{ ...BASE_NOTIFICATION, type: 'new_comment', title: 'New Comment' }}
          onClick={mockOnClick}
        />
      );
      expect(screen.getByText('💬')).toBeInTheDocument();
    });

    test('shows correct icon for issue_resolved type (✅)', () => {
      render(
        <NotificationItem
          notification={{ ...BASE_NOTIFICATION, type: 'issue_resolved', title: 'Issue Resolved!' }}
          onClick={mockOnClick}
        />
      );
      expect(screen.getByText('✅')).toBeInTheDocument();
    });

    test('shows action buttons when notification has actions', () => {
      const notifWithActions = {
        ...BASE_NOTIFICATION,
        actions: [
          { id: 'a1', label: 'View Issue', onClick: jest.fn() },
        ],
      };
      render(<NotificationItem notification={notifWithActions} onClick={mockOnClick} />);
      expect(screen.getByRole('button', { name: 'View Issue' })).toBeInTheDocument();
    });

    test('does not show action buttons when notification has no actions', () => {
      render(<NotificationItem notification={BASE_NOTIFICATION} onClick={mockOnClick} />);
      // No extra buttons beyond the main clickable area
      const clickableElements = screen.getAllByRole('button');
  
      expect(clickableElements).toHaveLength(1);
      
      // Verify it's the main notification by checking its content
      expect(clickableElements[0]).toHaveTextContent(/Issue Assigned/i);
      
      // No action-specific text should be present
      expect(screen.queryByText(/Accept/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Decline/i)).not.toBeInTheDocument();
    });
  });

  // ── Interactions ───────────────────────────────────────────────────────────
  describe('interactions', () => {

    test('calls onClick with notification ID when unread notification is clicked', async () => {
      const user = userEvent.setup();
      render(
        <NotificationItem
          notification={{ ...BASE_NOTIFICATION, read: false }}
          onClick={mockOnClick}
        />
      );

      await user.click(screen.getByText('Issue Assigned'));

      // Component calls onClick(notification.id) — NOT onClick(notification)
      expect(mockOnClick).toHaveBeenCalledWith('n1');
    });

    test('does NOT call onClick when read notification is clicked', async () => {
      const user = userEvent.setup();
      render(
        <NotificationItem
          notification={{ ...BASE_NOTIFICATION, read: true }}
          onClick={mockOnClick}
        />
      );

      await user.click(screen.getByText('Issue Assigned'));

      // Component only calls onClick when !notification.read
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    test('navigates to issue page when notification has issueId metadata', async () => {
      const user = userEvent.setup();
      render(
        <NotificationItem
          notification={{
            ...BASE_NOTIFICATION,
            read: true,
            metadata: { issueId: 'issue-abc' },
          }}
          onClick={mockOnClick}
        />
      );

      await user.click(screen.getByText('Issue Assigned'));
      expect(mockPush).toHaveBeenCalledWith('/issues/issue-abc');
    });

    test('navigates to achievements page when notification has achievementId metadata', async () => {
      const user = userEvent.setup();
      render(
        <NotificationItem
          notification={{
            ...BASE_NOTIFICATION,
            type: 'achievement_unlocked',
            read: true,
            title: 'Badge!',
            message: 'Earned a badge',
            metadata: { achievementId: 'ach-1' },
          }}
          onClick={mockOnClick}
        />
      );

      await user.click(screen.getByText('Badge!'));
      expect(mockPush).toHaveBeenCalledWith('/profile?section=achievements');
    });

    test('navigates to metadata.url when provided', async () => {
      const user = userEvent.setup();
      render(
        <NotificationItem
          notification={{
            ...BASE_NOTIFICATION,
            read: true,
            metadata: { url: '/tasks/assignments' },
          }}
          onClick={mockOnClick}
        />
      );

      await user.click(screen.getByText('Issue Assigned'));
      expect(mockPush).toHaveBeenCalledWith('/tasks/assignments');
    });

    test('does not navigate when notification has no metadata', async () => {
      const user = userEvent.setup();
      render(
        <NotificationItem
          notification={{ ...BASE_NOTIFICATION, read: true }}
          onClick={mockOnClick}
        />
      );

      await user.click(screen.getByText('Issue Assigned'));
      expect(mockPush).not.toHaveBeenCalled();
    });

    test('action button click does not bubble to parent click handler', async () => {
      const mockActionClick = jest.fn();
      const user = userEvent.setup();
      render(
        <NotificationItem
          notification={{
            ...BASE_NOTIFICATION,
            read: false,
            actions: [{ id: 'a1', label: 'View Issue', onClick: mockActionClick }],
          }}
          onClick={mockOnClick}
        />
      );

      await user.click(screen.getByRole('button', { name: 'View Issue' }));

      // Action click fires
      expect(mockActionClick).toHaveBeenCalled();
      // Parent onClick should NOT fire (stopPropagation)
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    test('keyboard Enter triggers the same behaviour as click', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <NotificationItem
          notification={{ ...BASE_NOTIFICATION, read: false }}
          onClick={mockOnClick}
        />
      );

      const item = container.firstChild as HTMLElement;
      item.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledWith('n1');
    });
  });

  // ── Priority variations ────────────────────────────────────────────────────
  describe('all notification types render without error', () => {
    const types = [
      'issue_update',
      'new_comment',
      'issue_resolved',
      'volunteer_assigned',
      'achievement_unlocked',
      'system_alert',
    ] as const;

    types.forEach(type => {
      test(`renders ${type} notification`, () => {
        render(
          <NotificationItem
            notification={{ ...BASE_NOTIFICATION, type, title: `${type} title` }}
            onClick={mockOnClick}
          />
        );
        expect(screen.getByText(`${type} title`)).toBeInTheDocument();
      });
    });
  });
});