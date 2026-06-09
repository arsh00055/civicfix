// ─────────────────────────────────────────────────────────────────────────────
// __tests__/components/EditProfilePage.test.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import apiClient from '@/lib/services/api/client';
import EditProfilePage from '@/app/profile/edit/page';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('@/features/auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('@/lib/services/api/client', () => ({
  __esModule: true,
  default: { post: jest.fn(), put: jest.fn() },
}));
jest.mock('@/components/layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('@/components/UI/buttons/PrimaryButton', () => ({
  __esModule: true,
  default: ({ children, disabled, type, isLoading }: any) => (
    <button type={type} disabled={disabled}>{isLoading ? 'Saving...' : children}</button>
  ),
}));
jest.mock('@/components/UI/buttons/SecondaryButton', () => ({
  __esModule: true,
  default: ({ children, onClick, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

const mockPush    = jest.fn();
const mockBack    = jest.fn();
const mockReplace = jest.fn();
const mockRefreshUser = jest.fn().mockResolvedValue(undefined);

const CITIZEN_USER = {
  id: 'user-1', name: 'Jaspreet Kaur', email: 'jaspreet@test.com',
  role: 'citizen', avatar: null, firstName: 'Jaspreet', lastName: 'Kaur',
  phone: '+91 6280283455', bio: 'Test bio', city: 'Ludhiana',
};

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush, back: mockBack, replace: mockReplace });
  (useAuth as jest.Mock).mockReturnValue({ user: CITIZEN_USER, refreshUser: mockRefreshUser });
});

describe('EditProfilePage', () => {

  describe('unauthenticated', () => {
    test('shows login prompt when no user', () => {
      (useAuth as jest.Mock).mockReturnValue({ user: null, refreshUser: mockRefreshUser });
      render(<EditProfilePage />);
      expect(screen.getByText(/please log in/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    test('login button navigates to /login', async () => {
      (useAuth as jest.Mock).mockReturnValue({ user: null, refreshUser: mockRefreshUser });
      const user = userEvent.setup();
      render(<EditProfilePage />);
      await user.click(screen.getByRole('button', { name: /log in/i }));
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('rendering', () => {
    test('renders Edit Profile heading', () => {
      render(<EditProfilePage />);
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    test('pre-fills first name from currentUser', () => {
      render(<EditProfilePage />);
      expect(screen.getByPlaceholderText(/enter your first name/i)).toHaveValue('Jaspreet');
    });

    test('pre-fills last name from currentUser', () => {
      render(<EditProfilePage />);
      expect(screen.getByPlaceholderText(/enter your last name/i)).toHaveValue('Kaur');
    });

    test('email field is disabled', () => {
      render(<EditProfilePage />);
      expect(screen.getByDisplayValue('jaspreet@test.com')).toBeDisabled();
    });

    test('shows Save Changes button', () => {
      render(<EditProfilePage />);
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    test('shows Cancel button', () => {
      render(<EditProfilePage />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    test('does not show Volunteer Details for citizen', () => {
      render(<EditProfilePage />);
      expect(screen.queryByText(/volunteer details/i)).not.toBeInTheDocument();
    });

    test('does not show Admin Details for citizen', () => {
      render(<EditProfilePage />);
      expect(screen.queryByText(/admin details/i)).not.toBeInTheDocument();
    });
  });

  describe('role-specific sections', () => {
    test('shows Volunteer Details section for volunteer', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { ...CITIZEN_USER, role: 'volunteer' },
        refreshUser: mockRefreshUser,
      });
      render(<EditProfilePage />);
      expect(screen.getByText(/volunteer details/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument(); // experience level select
    });

    test('shows Admin Details section for admin', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { ...CITIZEN_USER, role: 'admin' },
        refreshUser: mockRefreshUser,
      });
      render(<EditProfilePage />);
      expect(screen.getByText(/admin details/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/administration, it, hr/i)).toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    test('cancel button calls router.back()', async () => {
      const user = userEvent.setup();
      render(<EditProfilePage />);
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(mockBack).toHaveBeenCalled();
    });

    test('shows error for image larger than 5MB', async () => {
      const user = userEvent.setup();
      render(<EditProfilePage />);

      const bigFile = new File(['x'.repeat(6 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, bigFile);
      expect(screen.getByText(/must be less than 5mb/i)).toBeInTheDocument();
    });

    test('shows error for unsupported image type', async () => {
        const user = userEvent.setup();
        render(<EditProfilePage />);

        const pdfFile = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

        await user.upload(fileInput, pdfFile);

        // ✅ Correct expectation
        expect(
            screen.getByText(/jpeg, png, webp/i)
          ).toBeInTheDocument();
        });
  });

  describe('form submission', () => {
    test('calls apiClient.put on submit', async () => {
      (apiClient.put as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
      const user = userEvent.setup();
      render(<EditProfilePage />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => expect(apiClient.put).toHaveBeenCalledWith(
        '/users/profile',
        expect.objectContaining({ firstName: 'Jaspreet', lastName: 'Kaur' })
      ));
    });

    test('shows success message after save', async () => {
      (apiClient.put as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
      const user = userEvent.setup();
      render(<EditProfilePage />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() =>
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument()
      );
    });

    test('shows error message when save fails', async () => {
      (apiClient.put as jest.Mock).mockRejectedValueOnce({
        response: { data: { message: 'Update failed' } },
      });
      const user = userEvent.setup();
      render(<EditProfilePage />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() =>
        expect(screen.getByText(/update failed/i)).toBeInTheDocument()
      );
    });

    test('calls refreshUser after successful save', async () => {
      (apiClient.put as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
      const user = userEvent.setup();
      render(<EditProfilePage />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => expect(mockRefreshUser).toHaveBeenCalled());
    });

    test('includes volunteer fields when role is volunteer', async () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { ...CITIZEN_USER, role: 'volunteer', experienceLevel: 'intermediate' },
        refreshUser: mockRefreshUser,
      });
      (apiClient.put as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
      const user = userEvent.setup();
      render(<EditProfilePage />);

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        const payload = (apiClient.put as jest.Mock).mock.calls[0][1];
        expect(payload).toHaveProperty('experienceLevel');
        expect(payload).toHaveProperty('skills');
      });
    });
  });
});