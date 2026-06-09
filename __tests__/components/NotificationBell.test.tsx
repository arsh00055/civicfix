import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('@/features/auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));

// ── Mock useNotifications hook — this is what the component actually uses ─────
jest.mock('@/features/notifications/hooks/useNotifications', () => ({
  useNotifications: jest.fn(),
}));

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import NotificationBell from '@/components/layout/Header/NotificationBell';

const mockPush    = jest.fn();
const mockRefetch = jest.fn();
const mockMarkAsRead = jest.fn();

const MOCK_NOTIFICATIONS = [
  {
    id:        'n1',
    type:      'issue_update',
    title:     'Issue Updated',
    message:   'Your issue has been assigned to a volunteer.',
    read:      false,
    seen:      false,
    priority:  'medium',
    category:  'issue',
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id:        'n2',
    type:      'achievement_unlocked',
    title:     'Achievement Unlocked!',
    message:   'You earned the First Report badge.',
    read:      true,
    seen:      true,
    priority:  'low',
    category:  'achievement',
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

  (useAuth as jest.Mock).mockReturnValue({
    isAuthenticated: true,
    user: { id: 'user-1', role: 'citizen', name: 'Jaspreet' },
  });

  // Default hook return — 1 unread notification
  (useNotifications as jest.Mock).mockReturnValue({
    notifications: MOCK_NOTIFICATIONS,
    unreadCount:   1,       // only n1 is unread
    markAsRead:    mockMarkAsRead,
    refetch:       mockRefetch,
    loading:       false,
    error:         null,
  });
});

describe('NotificationBell', () => {

  // ── Rendering ──────────────────────────────────────────────────────────────
  describe('rendering', () => {

    test('renders the bell icon button with aria-label', () => {
      render(<NotificationBell />);
      expect(
        screen.getByRole('button', { name: /notifications/i })
      ).toBeInTheDocument();
    });

    test('shows unread count badge = 1 when unreadCount is 1', () => {
      render(<NotificationBell />);
      // Badge text = unreadCount from hook
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('shows unreadCount number in the badge', () => {
      (useNotifications as jest.Mock).mockReturnValueOnce({
        notifications: MOCK_NOTIFICATIONS,
        unreadCount:   3,
        markAsRead:    mockMarkAsRead,
        refetch:       mockRefetch,
        loading:       false,
        error:         null,
      });
      render(<NotificationBell />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    test('does not show badge when unreadCount is 0', () => {
      (useNotifications as jest.Mock).mockReturnValueOnce({
        notifications: MOCK_NOTIFICATIONS.map(n => ({ ...n, read: true })),
        unreadCount:   0,
        markAsRead:    mockMarkAsRead,
        refetch:       mockRefetch,
        loading:       false,
        error:         null,
      });
      render(<NotificationBell />);
      // Badge should not exist when count is 0
      expect(screen.queryByText('0')).not.toBeInTheDocument();
      // The span with bg-red-500 should not be rendered
      expect(document.querySelector('.bg-red-500')).toBeNull();
    });
  });

  // ── Dropdown ───────────────────────────────────────────────────────────────
  describe('dropdown behaviour', () => {

    test('dropdown is closed by default', () => {
      render(<NotificationBell />);
      // Notification messages should not be visible before clicking
      expect(
        screen.queryByText('Your issue has been assigned to a volunteer.')
      ).not.toBeInTheDocument();
    });

    test('clicking bell opens the dropdown', async () => {
      const user = userEvent.setup();
      render(<NotificationBell />);

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      // Component shows notification.message (not notification.title) in dropdown
      expect(
        screen.getByText('Your issue has been assigned to a volunteer.')
      ).toBeInTheDocument();
    });

    test('clicking bell again closes the dropdown', async () => {
      const user = userEvent.setup();
      render(<NotificationBell />);

      await user.click(screen.getByRole('button', { name: /notifications/i }));
      expect(
        screen.getByText('Your issue has been assigned to a volunteer.')
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /notifications/i }));
      expect(
        screen.queryByText('Your issue has been assigned to a volunteer.')
      ).not.toBeInTheDocument();
    });

    test('shows "View all notifications" link in dropdown', async () => {
      const user = userEvent.setup();
      render(<NotificationBell />);

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.getByText('View all notifications')).toBeInTheDocument();
    });

    test('"View all notifications" is an <a> link to /notifications', async () => {
      const user = userEvent.setup();
      render(<NotificationBell />);

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      // Component uses <a href="/notifications"> not router.push
      const link = screen.getByText('View all notifications');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/notifications');
    });

    test('shows empty state text when no notifications', async () => {
      (useNotifications as jest.Mock).mockReturnValue({
        notifications: [],
        unreadCount:   0,
        markAsRead:    mockMarkAsRead,
        refetch:       mockRefetch,
        loading:       false,
        error:         null,
      });

      const user = userEvent.setup();
      render(<NotificationBell />);

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      // Component renders "No notifications" when array is empty
      expect(screen.getByText(/No notifications/)).toBeInTheDocument();
    });

    test('shows Notifications heading in dropdown', async () => {
      const user = userEvent.setup();
      render(<NotificationBell />);

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    test('unread notifications have blue background in dropdown', async () => {
      const user = userEvent.setup();
      render(<NotificationBell />);

      await user.click(screen.getByRole('button', { name: /notifications/i }));

      // n1 is unread — its container has bg-blue-50 class
      const unreadItem = screen.getByText('Your issue has been assigned to a volunteer.')
        .closest('div[class*="bg-blue-50"]');
      expect(unreadItem).toBeInTheDocument();
    });
  });

  // ── Mark as read ───────────────────────────────────────────────────────────
  describe('mark as read', () => {

    test('clicking an unread notification calls markAsRead with its id', async () => {
      const user = userEvent.setup();
      render(<NotificationBell />);

      await user.click(screen.getByRole('button', { name: /notifications/i }));
      await user.click(
        screen.getByText('Your issue has been assigned to a volunteer.')
      );

      // Component calls markAsRead(notification.id) for unread items
      expect(mockMarkAsRead).toHaveBeenCalledWith('n1');
    });

    test('clicking a read notification does not call markAsRead', async () => {
      const user = userEvent.setup();
      render(<NotificationBell />);

      await user.click(screen.getByRole('button', { name: /notifications/i }));
      await user.click(screen.getByText('You earned the First Report badge.'));

      expect(mockMarkAsRead).not.toHaveBeenCalled();
    });
  });

  // ── Hook integration ───────────────────────────────────────────────────────
  describe('hook integration', () => {

    test('calls refetch on mount via useEffect', () => {
      render(<NotificationBell />);
      // Component calls refetch() in useEffect on mount
      expect(mockRefetch).toHaveBeenCalled();
    });

    test('useNotifications hook is called', () => {
      render(<NotificationBell />);
      expect(useNotifications).toHaveBeenCalled();
    });
  });
});