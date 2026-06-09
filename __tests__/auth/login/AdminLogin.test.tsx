import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import AdminLogin from '@/features/auth/components/AdminLogin';

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('@/features/auth/hooks/useAuth', () => ({ useAuth: jest.fn() }));

jest.mock('@/components/UI/forms/InputField', () => ({
  __esModule: true,
  default: ({ label, type, value, onChange, placeholder, showPasswordToggle, onTogglePassword, isPasswordVisible }: any) => (
    <div>
      <label>{label}</label>
      <input
        aria-label={label}
        type={type === 'email' ? 'text' : type || 'text'}
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
  default: ({ children, disabled, type }: any) => (
    <button type={type} disabled={disabled}>{children}</button>
  ),
}));

// ── Setup ─────────────────────────────────────────────────────────────────────
const mockPush  = jest.fn();
const mockLogin = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (useAuth as jest.Mock).mockReturnValue({ login: mockLogin, isLoading: false });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('AdminLogin', () => {

  // ── Rendering ──────────────────────────────────────────────────────────────
  describe('rendering', () => {

    test('renders Admin Login heading', () => {
      render(<AdminLogin />);
      expect(screen.getByText(/admin.*login|administrator.*login/i)).toBeInTheDocument();
    });

    test('renders email field', () => {
      render(<AdminLogin />);
      expect(screen.getByPlaceholderText(/enter your admin email/i)).toBeInTheDocument();
    });

    test('renders password field', () => {
      render(<AdminLogin />);
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    });

    test('renders security key field', () => {
      render(<AdminLogin />);
      expect(
        screen.getByPlaceholderText(/security key|admin.*key/i)
      ).toBeInTheDocument();
    });

    test('renders Sign in as Administrator button', () => {
      render(<AdminLogin />);
      expect(
        screen.getByRole('button', { name: /sign in as admin/i })
      ).toBeInTheDocument();
    });

    test('renders Forgot Password link', () => {
      render(<AdminLogin />);
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });
  });

  describe('validation', () => {

    test('shows error when email is empty', async () => {
      const user = userEvent.setup();
      render(<AdminLogin />);

      await user.click(screen.getByRole('button', { name: /sign in as admin/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/email.*required/i);
      });
      expect(mockLogin).not.toHaveBeenCalled();
    });

    test('shows error when password is empty', async () => {
      const user = userEvent.setup();
      render(<AdminLogin />);

      await user.type(screen.getByPlaceholderText(/enter your admin email/i), 'admin@test.com');
      await user.click(screen.getByRole('button', { name: /sign in as admin/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/password.*required/i);
      });
    });

    test('shows error when security key is empty', async () => {
      const user = userEvent.setup();
      render(<AdminLogin />);

      await user.type(screen.getByPlaceholderText(/enter your admin email/i), 'admin@test.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'Admin1234!');
      // intentionally skip security key
      await user.click(screen.getByRole('button', { name: /sign in as admin/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/security key.*required/i);
      });
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  // ── Successful login ────────────────────────────────────────────────────────
  describe('successful login', () => {

    test('calls login() with role: admin and securityKey', async () => {
      mockLogin.mockResolvedValueOnce({ success: true });
      const user = userEvent.setup();
      render(<AdminLogin />);

      await user.type(screen.getByPlaceholderText(/enter your admin email/i), 'admin@civicfix.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'Admin1234!');
      await user.type(screen.getByPlaceholderText(/security key/i), 'SECRET-KEY-123');
      await user.click(screen.getByRole('button', { name: /sign in as admin/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          'admin@civicfix.com',
          'Admin1234!',
          'admin',
          expect.objectContaining({ securityKey: 'SECRET-KEY-123' })
        );
      });
    });

    test('shows loading state while signing in', async () => {
      mockLogin.mockImplementation(() => new Promise(() => {}));
      const user = userEvent.setup();
      render(<AdminLogin />);

      await user.type(screen.getByPlaceholderText(/enter your admin email/i), 'admin@civicfix.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'Admin1234!');
      await user.type(screen.getByPlaceholderText(/security key/i), 'SECRET-KEY-123');
      await user.click(screen.getByRole('button', { name: /sign in as admin/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
      });
    });
  });

  // ── Failed login ────────────────────────────────────────────────────────────
  describe('failed login', () => {

    test('shows error for wrong credentials', async () => {
      mockLogin.mockResolvedValueOnce({
        success: false,
        message: 'Incorrect password. Please try again.',
      });
      const user = userEvent.setup();
      render(<AdminLogin />);

      await user.type(screen.getByPlaceholderText(/enter your admin email/i), 'admin@civicfix.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'wrongpass');
      await user.type(screen.getByPlaceholderText(/security key/i), 'WRONG-KEY');
      await user.click(screen.getByRole('button', { name: /sign in as admin/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/incorrect password/i);
      });
    });

    test('shows error when account is deactivated', async () => {
      mockLogin.mockResolvedValueOnce({
        success: false,
        message: 'Admin account has been deactivated. Please contact super admin.',
      });
      const user = userEvent.setup();
      render(<AdminLogin />);

      await user.type(screen.getByPlaceholderText(/enter your admin email/i), 'admin@civicfix.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'Admin1234!');
      await user.type(screen.getByPlaceholderText(/security key/i), 'SECRET-KEY');
      await user.click(screen.getByRole('button', { name: /sign in as admin/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/deactivated/i);
      });
    });

    test('shows error when login throws network exception', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Network error'));
      const user = userEvent.setup();
      render(<AdminLogin />);

      await user.type(screen.getByPlaceholderText(/enter your admin email/i), 'admin@civicfix.com');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'Admin1234!');
      await user.type(screen.getByPlaceholderText(/security key/i), 'SECRET-KEY');
      await user.click(screen.getByRole('button', { name: /sign in as admin/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/network error|try again/i);
      });
    });
  });

  // ── Password visibility ─────────────────────────────────────────────────────
  describe('password visibility', () => {

    test('password is hidden by default', () => {
      render(<AdminLogin />);
      expect(screen.getByPlaceholderText(/enter your password/i))
        .toHaveAttribute('type', 'password');
    });

    test('toggle button reveals password', async () => {
      const user = userEvent.setup();
      render(<AdminLogin />);

      await user.click(screen.getByRole('button', { name: /toggle password/i }));
      expect(screen.getByPlaceholderText(/enter your password/i))
        .toHaveAttribute('type', 'text');
    });
  });

  // ── Navigation ──────────────────────────────────────────────────────────────
  describe('navigation', () => {

    test('forgot password navigates to /forgot-password', async () => {
      const user = userEvent.setup();
      render(<AdminLogin />);

      await user.click(screen.getByText(/forgot password/i));
      expect(mockPush).toHaveBeenCalledWith('/forgot-password');
    });
  });
});