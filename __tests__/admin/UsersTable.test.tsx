jest.mock('@/components/UI/icons', () => ({
    EnvelopeIcon:    ({ className }: any) => <svg data-testid="envelope-icon" className={className} />,
    UserCircleIcon:  ({ className }: any) => <svg data-testid="user-circle-icon" className={className} />,
    UsersIcon:       ({ className }: any) => <svg data-testid="users-icon" className={className} />,
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsersTable from '@/app/(dashboard)/admin/user-management/components/UsersTable';

const MOCK_USERS = [
  {
    id: 'user-1', name: 'Jaspreet Kaur', email: 'jaspreet@test.com', firstName: 'Jaspreet', lastName: 'Kaur', phone: '628023455',
    role: 'citizen' as const, avatar: null, isActive: true,
    createdAt: '2024-01-15T10:00:00.000Z',
    isVerified: true, updatedAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'user-2', name: 'Arshdeep Kaur', email: 'arshdeep@test.com', firstName: 'Arshdeep', lastName: 'Kaur', phone: '7279800055',
    role: 'volunteer' as const, avatar: null, isActive: false,
    createdAt: '2024-01-16T10:00:00.000Z',
    isVerified: true, updatedAt: '2024-01-16T10:00:00.000Z',
  },
  {
    id: 'user-3', name: 'Admin User', email: 'admin@test.com', firstName: 'Admin', lastName: 'User', phone: '123456789',
    role: 'admin' as const, avatar: null, isActive: true,
    createdAt: '2024-01-17T10:00:00.000Z',
    isVerified: true, updatedAt: '2024-01-17T10:00:00.000Z',
  },
];

const mockOnUpdateRole   = jest.fn();
const mockOnToggleActive = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe('UsersTable', () => {

  describe('empty state', () => {
    test('shows no users found message when list is empty', () => {
      render(
        <UsersTable users={[]} updatingUser={null}
          onUpdateRole={mockOnUpdateRole} onToggleActive={mockOnToggleActive} />
      );
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });

  describe('rendering users', () => {
    test('renders all user names', () => {
      render(
        <UsersTable users={MOCK_USERS} updatingUser={null}
          onUpdateRole={mockOnUpdateRole} onToggleActive={mockOnToggleActive} />
      );
      expect(screen.getByText('Jaspreet Kaur')).toBeInTheDocument();
      expect(screen.getByText('Arshdeep Kaur')).toBeInTheDocument();
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    test('renders email addresses', () => {
      render(
        <UsersTable users={MOCK_USERS} updatingUser={null}
          onUpdateRole={mockOnUpdateRole} onToggleActive={mockOnToggleActive} />
      );
      expect(screen.getByText('jaspreet@test.com')).toBeInTheDocument();
    });

    test('renders role badges with correct colors', () => {
      render(
        <UsersTable users={MOCK_USERS} updatingUser={null}
          onUpdateRole={mockOnUpdateRole} onToggleActive={mockOnToggleActive} />
      );
      expect(screen.getByText('Citizen')).toBeInTheDocument();
      expect(screen.getByText('Volunteer')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    test('shows Active badge for active users', () => {
      render(
        <UsersTable users={MOCK_USERS} updatingUser={null}
          onUpdateRole={mockOnUpdateRole} onToggleActive={mockOnToggleActive} />
      );
      expect(screen.getAllByText('Active')).toHaveLength(2); // user-1 and user-3
    });

    test('shows Deactivated badge for inactive users', () => {
      render(
        <UsersTable users={MOCK_USERS} updatingUser={null}
          onUpdateRole={mockOnUpdateRole} onToggleActive={mockOnToggleActive} />
      );
      expect(screen.getByText('Deactivated')).toBeInTheDocument();
    });

    test('shows Deactivate button for active users', () => {
      render(
        <UsersTable users={MOCK_USERS} updatingUser={null}
          onUpdateRole={mockOnUpdateRole} onToggleActive={mockOnToggleActive} />
      );
      expect(screen.getAllByText('Deactivate').length).toBeGreaterThan(0);
    });

    test('shows Activate button for inactive users', () => {
      render(
        <UsersTable users={MOCK_USERS} updatingUser={null}
          onUpdateRole={mockOnUpdateRole} onToggleActive={mockOnToggleActive} />
      );
      expect(screen.getByText('Activate')).toBeInTheDocument();
    });
  });

  describe('actions', () => {
    test('calls onToggleActive with userId and current status on button click', async () => {
      const user = userEvent.setup();
      render(
        <UsersTable users={MOCK_USERS} updatingUser={null}
          onUpdateRole={mockOnUpdateRole} onToggleActive={mockOnToggleActive} />
      );
      await user.click(screen.getAllByText('Deactivate')[0]);
      expect(mockOnToggleActive).toHaveBeenCalledWith('user-1', true);
    });

    test('calls onToggleActive with false for inactive user', async () => {
      const user = userEvent.setup();
      render(
        <UsersTable users={MOCK_USERS} updatingUser={null}
          onUpdateRole={mockOnUpdateRole} onToggleActive={mockOnToggleActive} />
      );
      await user.click(screen.getByText('Activate'));
      expect(mockOnToggleActive).toHaveBeenCalledWith('user-2', false);
    });

    test('shows Updating... and disables button when updatingUser matches', () => {
      render(
        <UsersTable users={MOCK_USERS} updatingUser="user-1"
          onUpdateRole={mockOnUpdateRole} onToggleActive={mockOnToggleActive} />
      );
      expect(screen.getByText('Updating...')).toBeInTheDocument();
      expect(screen.getByText('Updating...')).toBeDisabled();
    });

    test('only disables the updating user row, not others', () => {
      render(
        <UsersTable users={MOCK_USERS} updatingUser="user-1"
          onUpdateRole={mockOnUpdateRole} onToggleActive={mockOnToggleActive} />
      );
      const buttons = screen.getAllByRole('button');
      const updatingBtn = buttons.find(b => b.textContent === 'Updating...');
      const otherBtn    = buttons.find(b => b.textContent === 'Activate');
      expect(updatingBtn).toBeDisabled();
      expect(otherBtn).not.toBeDisabled();
    });
  });
});