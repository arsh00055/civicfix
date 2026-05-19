import RegistrationPage from '@/app/(auth)/register/page';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

jest.mock('@/app/(auth)/register/components/CitizenRegistration', () => ({
  __esModule: true,
  default: ({ onSuccess, onSwitchToLogin }: any) => (
    <div data-testid="citizen-registration">
      <button onClick={onSuccess}>Mock Submit Citizen</button>
      <button onClick={onSwitchToLogin}>Mock Switch Login</button>
    </div>
  ),
}));

jest.mock('@/app/(auth)/register/components/VolunteerRegistration', () => ({
  __esModule: true,
  default: ({ onSuccess, onSwitchToLogin }: any) => (
    <div data-testid="volunteer-registration">
      <button onClick={onSuccess}>Mock Submit Volunteer</button>
    </div>
  ),
}));

jest.mock('@/app/loading', () => ({
  __esModule: true,
  default: () => <div>Loading...</div>,
}));

// ── Setup ─────────────────────────────────────────────────────────────────────
const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('RegistrationPage', () => {

  // ── Role selection screen ─────────────────────────────────────────────────
  describe('role selection', () => {
    test('renders both role cards initially', () => {
      render(<RegistrationPage />);
      expect(screen.getByRole('button', { name: /join as citizen/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /become a volunteer/i })).toBeInTheDocument();
    });

    test('renders the heading and description', () => {
      render(<RegistrationPage />);
      expect(screen.getByText(/create your account/i)).toBeInTheDocument();
      expect(screen.getByText(/choose how you want to participate/i)).toBeInTheDocument();
    });

    test('renders sign in link', () => {
      render(<RegistrationPage />);
      expect(screen.getByRole('link', { name: /sign in here/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in here/i })).toHaveAttribute('href', '/login');
    });

    test('does not show back button on initial screen', () => {
      render(<RegistrationPage />);
      expect(screen.queryByRole('button', { name: /back to role selection/i })).not.toBeInTheDocument();
    });
  });

  // ── Selecting citizen role ────────────────────────────────────────────────
  describe('selecting citizen role', () => {
    test('shows CitizenRegistration form after clicking Join as Citizen', async () => {
      const user = userEvent.setup();
      render(<RegistrationPage />);

      await user.click(screen.getByRole('button', { name: /join as citizen/i }));

      await waitFor(() => {
        expect(screen.getByTestId('citizen-registration')).toBeInTheDocument();
      });
    });

    test('hides role selection cards after citizen is selected', async () => {
      const user = userEvent.setup();
      render(<RegistrationPage />);

      await user.click(screen.getByRole('button', { name: /join as citizen/i }));

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /become a volunteer/i })).not.toBeInTheDocument();
      });
    });

    test('shows back button after role is selected', async () => {
      const user = userEvent.setup();
      render(<RegistrationPage />);

      await user.click(screen.getByRole('button', { name: /join as citizen/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to role selection/i })).toBeInTheDocument();
      });
    });
  });

  // ── Selecting volunteer role ──────────────────────────────────────────────
  describe('selecting volunteer role', () => {
    test('shows VolunteerRegistration form after clicking Become Volunteer', async () => {
      const user = userEvent.setup();
      render(<RegistrationPage />);

      await user.click(screen.getByRole('button', { name: /become a volunteer/i }));

      await waitFor(() => {
        expect(screen.getByTestId('volunteer-registration')).toBeInTheDocument();
      });
    });
  });

  // ── Back button ───────────────────────────────────────────────────────────
  describe('back button', () => {
    test('clicking back returns to role selection', async () => {
      const user = userEvent.setup();
      render(<RegistrationPage />);

      await user.click(screen.getByRole('button', { name: /join as citizen/i }));
      await waitFor(() => screen.getByTestId('citizen-registration'));

      await user.click(screen.getByRole('button', { name: /back to role selection/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /join as citizen/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /become a volunteer/i })).toBeInTheDocument();
      });
    });
  });

  // ── Callbacks ─────────────────────────────────────────────────────────────
  describe('callbacks', () => {
    test('redirects to login with success message after registration', async () => {
      const user = userEvent.setup();
      render(<RegistrationPage />);

      await user.click(screen.getByRole('button', { name: /join as citizen/i }));
      await waitFor(() => screen.getByTestId('citizen-registration'));

      // our mock CitizenRegistration calls onSuccess when this button is clicked
      await user.click(screen.getByRole('button', { name: /mock submit citizen/i }));

      expect(mockPush).toHaveBeenCalledWith('/login?message=registration_success');
    });

    test('redirects to login when switch to login is triggered', async () => {
      const user = userEvent.setup();
      render(<RegistrationPage />);

      await user.click(screen.getByRole('button', { name: /join as citizen/i }));
      await waitFor(() => screen.getByTestId('citizen-registration'));

      await user.click(screen.getByRole('button', { name: /mock switch login/i }));

      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
});