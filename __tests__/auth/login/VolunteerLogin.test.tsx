// __tests__/auth/login/VolunteerLogin.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import VolunteerLogin from '@/features/auth/components/VolunteerLogin';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('@/features/auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));

// Mock InputField — renders real inputs so tests can type into them
jest.mock('@/components/UI/forms/InputField', () => ({
  __esModule: true,
  default: ({
    label, type, value, onChange, placeholder,
    showPasswordToggle, onTogglePassword, isPasswordVisible
  }: any) => (
    <div>
      <label>{label}</label>
      <input
        aria-label={label}
        type={type || 'text'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {showPasswordToggle && (
        <button type="button" onClick={onTogglePassword} aria-label="toggle password">
          {isPasswordVisible ? 'Hide' : 'Show'}
        </button>
      )}
    </div>
  ),
}));

jest.mock('@/components/UI/buttons/PrimaryButton', () => ({
  __esModule: true,
  default: ({ children, disabled, type, role: btnRole }: any) => (
    <button type={type} disabled={disabled} data-role={btnRole}>
      {children}
    </button>
  ),
}));

// ── Helpers ────────────────────────────────────────────────────────────────
const mockPush  = jest.fn();
const mockLogin = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (useAuth as jest.Mock).mockReturnValue({ login: mockLogin, isLoading: false });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('VolunteerLogin', () => {

  // ── Rendering ──────────────────────────────────────────────────────────────
  describe('rendering', () => {
    test('renders the heading', () => {
      render(<VolunteerLogin />);
      expect(screen.getByText(/volunteer login/i)).toBeInTheDocument();
    });

    test('renders email and password fields', () => {
      render(<VolunteerLogin />);
      expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    });

    test('renders sign in button', () => {
      render(<VolunteerLogin />);
      expect(screen.getByRole('button', { name: /sign in as volunteer/i })).toBeInTheDocument();
    });

    test('renders forgot password button', () => {
      render(<VolunteerLogin />);
      expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
    });

    test('renders Apply to be a Volunteer button', () => {
      render(<VolunteerLogin />);
      expect(screen.getByRole('button', { name: /apply to be a volunteer/i })).toBeInTheDocument();
    });

    test('sign in button has green role styling', () => {
      render(<VolunteerLogin />);
      expect(screen.getByRole('button', { name: /sign in as volunteer/i }))
        .toHaveAttribute('data-role', 'volunteer');
    });
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  describe('validation', () => {
    test('shows error when email is empty', async () => {
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      await user.click(screen.getByRole('button', { name: /sign in as volunteer/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/email is required/i);
      });
      expect(mockLogin).not.toHaveBeenCalled();
    });

    test('shows error when password is empty', async () => {
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      await user.type(screen.getByPlaceholderText(/enter your email/i), 'arshdeep@test.com');
      await user.click(screen.getByRole('button', { name: /sign in as volunteer/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/password is required/i);
      });
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  // ── Successful login ────────────────────────────────────────────────────────
  describe('successful login', () => {
    test('calls login() with email, password, volunteer role and empty object', async () => {
      mockLogin.mockResolvedValueOnce({ success: true });
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      await user.type(screen.getByPlaceholderText(/enter your email/i), 'arshdeep@test.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'Pass1234!');
      await user.click(screen.getByRole('button', { name: /sign in as volunteer/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          'arshdeep@test.com',
          'Pass1234!',
          'volunteer',
          {}
        );
      });
    });

    test('shows loading text while signing in', async () => {
      // login never resolves so we can catch the loading state
      mockLogin.mockImplementation(() => new Promise(() => {}));
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      await user.type(screen.getByPlaceholderText(/enter your email/i), 'arshdeep@test.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'Pass1234!');
      await user.click(screen.getByRole('button', { name: /sign in as volunteer/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
      });
    });
  });

  // ── Account pending approval ────────────────────────────────────────────────
  describe('account pending approval', () => {
    test('shows pending approval message when login returns ACCOUNT_PENDING_APPROVAL code', async () => {
      mockLogin.mockResolvedValueOnce({
        success: false,
        code: 'ACCOUNT_PENDING_APPROVAL',
        message: 'Your account is pending admin approval.',
      });
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      await user.type(screen.getByPlaceholderText(/enter your email/i), 'pending@test.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'Pass1234!');
      await user.click(screen.getByRole('button', { name: /sign in as volunteer/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/pending admin approval/i);
      });
    });

    test('shows email hint for pending accounts', async () => {
      mockLogin.mockResolvedValueOnce({
        success: false,
        code: 'ACCOUNT_PENDING_APPROVAL',
      });
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      await user.type(screen.getByPlaceholderText(/enter your email/i), 'pending@test.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'Pass1234!');
      await user.click(screen.getByRole('button', { name: /sign in as volunteer/i }));

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
    });

    test('pending alert has yellow styling', async () => {
      mockLogin.mockResolvedValueOnce({
        success: false,
        code: 'ACCOUNT_PENDING_APPROVAL',
      });
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      await user.type(screen.getByPlaceholderText(/enter your email/i), 'pending@test.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'Pass1234!');
      await user.click(screen.getByRole('button', { name: /sign in as volunteer/i }));

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert.className).toMatch(/yellow/);
      });
    });
  });

  // ── Account rejected ────────────────────────────────────────────────────────
  describe('account rejected', () => {
    test('shows rejection message when login returns ACCOUNT_REJECTED code', async () => {
      mockLogin.mockResolvedValueOnce({
        success: false,
        code: 'ACCOUNT_REJECTED',
        message: 'Your volunteer application has been rejected.',
      });
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      await user.type(screen.getByPlaceholderText(/enter your email/i), 'rejected@test.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'Pass1234!');
      await user.click(screen.getByRole('button', { name: /sign in as volunteer/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/rejected/i);
      });
    });

    test('shows Contact Support button for rejected accounts', async () => {
      mockLogin.mockResolvedValueOnce({
        success: false,
        code: 'ACCOUNT_REJECTED',
      });
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      await user.type(screen.getByPlaceholderText(/enter your email/i), 'rejected@test.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'Pass1234!');
      await user.click(screen.getByRole('button', { name: /sign in as volunteer/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /contact support/i })).toBeInTheDocument();
      });
    });

    test('rejected alert has red styling', async () => {
      mockLogin.mockResolvedValueOnce({
        success: false,
        code: 'ACCOUNT_REJECTED',
      });
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      await user.type(screen.getByPlaceholderText(/enter your email/i), 'rejected@test.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'Pass1234!');
      await user.click(screen.getByRole('button', { name: /sign in as volunteer/i }));

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert.className).toMatch(/red/);
      });
    });
  });

  // ── Generic failed login ────────────────────────────────────────────────────
  describe('failed login', () => {
    test('shows error when login returns success false with no code', async () => {
      mockLogin.mockResolvedValueOnce({
        success: false,
        message: 'Invalid email or password.',
      });
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      await user.type(screen.getByPlaceholderText(/enter your email/i), 'wrong@test.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /sign in as volunteer/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/invalid email or password/i);
      });
    });

    test('shows error when login throws an exception', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Login failed. Please try again.'));
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      await user.type(screen.getByPlaceholderText(/enter your email/i), 'arshdeep@test.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'Pass1234!');
      await user.click(screen.getByRole('button', { name: /sign in as volunteer/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/login failed/i);
      });
    });

    test('shows pending approval message when error has ACCOUNT_PENDING_APPROVAL code', async () => {
      mockLogin.mockRejectedValueOnce({
        response: { data: { code: 'ACCOUNT_PENDING_APPROVAL' } },
        message: 'Request failed',
      });
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      await user.type(screen.getByPlaceholderText(/enter your email/i), 'pending@test.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'Pass1234!');
      await user.click(screen.getByRole('button', { name: /sign in as volunteer/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/pending admin approval/i);
      });
    });
  });

  // ── Navigation ─────────────────────────────────────────────────────────────
  describe('navigation', () => {
    test('forgot password button navigates to /forgot-password', async () => {
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      await user.click(screen.getByRole('button', { name: /forgot password/i }));
      expect(mockPush).toHaveBeenCalledWith('/forgot-password');
    });

    test('Apply to be a Volunteer button navigates to /register/volunteer', async () => {
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      await user.click(screen.getByRole('button', { name: /apply to be a volunteer/i }));
      expect(mockPush).toHaveBeenCalledWith('/register/volunteer');
    });
  });

  // ── Password visibility toggle ──────────────────────────────────────────────
  describe('password visibility', () => {
    test('password field is hidden by default', () => {
      render(<VolunteerLogin />);
      // Component passes type based on showPassword state — default is password
      // Our mock InputField renders it as the type prop
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('clicking show/hide toggles password visibility', async () => {
      const user = userEvent.setup();
      render(<VolunteerLogin />);

      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(screen.getByRole('button', { name: /toggle password/i }));
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(screen.getByRole('button', { name: /toggle password/i }));
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });
});