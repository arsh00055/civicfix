/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import CitizenRegistration from '@/app/(auth)/register/components/CitizenRegistration';

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('@/lib/hooks/useRegistrationSettings', () => ({
  useRegistrationSettings: () => ({
    settings: {
      allowCitizenRegistration: true,
      allowVolunteerRegistration: true,
      supportEmail: 'support@civicfix.com',
    },
    loading: false,
  }),
}));

jest.mock('@/lib/services/api/client', () => ({
  __esModule: true,
  default: { post: jest.fn() }
}));

// Then in your tests, import it and cast:
import apiClient from '@/lib/services/api/client';

beforeEach(() => {
  jest.clearAllMocks();
  (apiClient.post as jest.Mock).mockResolvedValue({ data: { success: true } });
});

// RHFInputField renders a label + input — mock it simply
jest.mock('@/components/UI/forms/RHFInputField', () => ({
  __esModule: true,
  default: ({ label, type, registration, error, placeholder, required }: any) => (
    <div>
      <label htmlFor={registration?.name}>{label}{required && ' *'}</label>
      <input
        id={registration?.name}
        // ↓ Always use text so browser validation doesn't interfere with Zod
        type={type === 'email' || type === 'password' ? 'text' : (type || 'text')}
        placeholder={placeholder || label}
        {...registration}
        aria-invalid={!!error}
      />
      {error && <span role="alert">{error}</span>}
    </div>
  ),
}));

jest.mock('@/components/UI/buttons/PrimaryButton', () => ({
  __esModule: true,
  default: ({ children, disabled, type, className }: any) => (
    <button type={type} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
const mockOnSuccess = jest.fn();
const mockOnSwitchToLogin = jest.fn();
const mockPush = jest.fn();

const VALID_FORM_DATA = {
  firstName:       'Jaspreet',
  lastName:        'Kaur',
  email:           'jaspreet@test.com',
  phone:           '+91 6280283455',
  address:         '123 Main Street',
  city:            'Ludhiana',
  role: 'citizen',
  zipCode:         '141001',
  password:        'Test1234!',
  confirmPassword: 'Test1234!',
};

async function fillForm(user: ReturnType<typeof userEvent.setup>, overrides: Partial<typeof VALID_FORM_DATA> = {}) {
  const data = { ...VALID_FORM_DATA, ...overrides };

  await user.type(screen.getByPlaceholderText(/first name/i), data.firstName);
  await user.type(screen.getByPlaceholderText(/last name/i),  data.lastName);
  await user.type(screen.getByPlaceholderText(/email/i),       data.email);
  if (data.phone) {
    await user.type(screen.getByPlaceholderText(/\+1.*555/i),  data.phone);
  }
  await user.type(screen.getByPlaceholderText(/123 main/i),    data.address);
  await user.type(screen.getByPlaceholderText(/new york/i),    data.city);
  await user.type(screen.getByPlaceholderText(/10001/i),       data.zipCode);
  await user.type(screen.getByPlaceholderText(/at least 8/i),  data.password);
  await user.type(screen.getByPlaceholderText(/confirm your/i),data.confirmPassword);
  // check the terms checkbox
  await user.click(screen.getByRole('checkbox'));
}

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CitizenRegistration', () => {

  // ── Rendering ────────────────────────────────────────────────────────────
  describe('rendering', () => {
    test('renders the heading', () => {
      render(<CitizenRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);
      expect(screen.getByText(/join as citizen/i)).toBeInTheDocument();
    });

    test('renders all required fields', () => {
      render(<CitizenRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);
      expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/123 main/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/new york/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/10001/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/at least 8/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/confirm your/i)).toBeInTheDocument();
    });

    test('renders terms checkbox', () => {
      render(<CitizenRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    test('renders submit button', () => {
      render(<CitizenRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);
      expect(screen.getByRole('button', { name: /create citizen account/i })).toBeInTheDocument();
    });
  });

  // ── Validation ───────────────────────────────────────────────────────────
  describe('validation', () => {
    test('shows validation errors when submitted empty', async () => {
      const user = userEvent.setup();
      render(<CitizenRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

      await user.click(screen.getByRole('button', { name: /create citizen account/i }));

      await waitFor(() => {
        // Zod schema errors bubble up via RHFInputField error prop
        expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
      });
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    test('shows error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<CitizenRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

      await fillForm(user, { confirmPassword: 'WrongPass!' });

      await user.click(screen.getByRole('button', { name: /create citizen account/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
      });
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    test('shows error for invalid email', async () => {
      const user = userEvent.setup();
      render(<CitizenRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

      await fillForm(user, { email: 'notanemail' });
      await user.click(screen.getByRole('button', { name: /create citizen account/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    test('shows error when password is too short', async () => {
      const user = userEvent.setup();
      render(<CitizenRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

      await fillForm(user, { password: 'short', confirmPassword: 'short' });
      await user.click(screen.getByRole('button', { name: /create citizen account/i }));

      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      });
    });

    test('shows error when terms are not agreed', async () => {
      const user = userEvent.setup();
      render(<CitizenRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

      // fill everything but don't check terms
      await user.type(screen.getByPlaceholderText(/first name/i), VALID_FORM_DATA.firstName);
      await user.type(screen.getByPlaceholderText(/last name/i),  VALID_FORM_DATA.lastName);
      await user.type(screen.getByPlaceholderText(/email/i),       VALID_FORM_DATA.email);
      await user.type(screen.getByPlaceholderText(/123 main/i),    VALID_FORM_DATA.address);
      await user.type(screen.getByPlaceholderText(/new york/i),    VALID_FORM_DATA.city);
      await user.type(screen.getByPlaceholderText(/10001/i),       VALID_FORM_DATA.zipCode);
      await user.type(screen.getByPlaceholderText(/at least 8/i),  VALID_FORM_DATA.password);
      await user.type(screen.getByPlaceholderText(/confirm your/i),VALID_FORM_DATA.confirmPassword);
      // intentionally skip checkbox
      await user.click(screen.getByRole('button', { name: /create citizen account/i }));

      await waitFor(() => {
        expect(screen.getByText(/agree to the terms/i)).toBeInTheDocument();
      });
    });
  });

  // ── Successful submission ─────────────────────────────────────────────────
  describe('successful submission', () => {
    test('calls apiClient.post with correct endpoint and data', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
      const user = userEvent.setup();
      render(<CitizenRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);
    
      await fillForm(user);
      await user.click(screen.getByRole('button', { name: /create citizen account/i }));
    
      // Check immediately after click, not after waiting for navigation
      await waitFor(() => expect(apiClient.post).toHaveBeenCalled());
    
      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/register/citizen',
        expect.objectContaining({
          firstName: 'Jaspreet',
          lastName: 'Kaur',
          email: 'jaspreet@test.com',
        })
      );
      // Note: don't assert role here since the component strips it
      // OR assert it if your component does add it:
      const payload = (apiClient.post as jest.Mock).mock.calls[0][1];
      expect(payload).not.toHaveProperty('confirmPassword');
      expect(payload).not.toHaveProperty('agreeToTerms');
    });

    test('does NOT send confirmPassword or agreeToTerms to the API', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
      const user = userEvent.setup();
      render(<CitizenRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

      await fillForm(user);
      await user.click(screen.getByRole('button', { name: /create citizen account/i }));

      await waitFor(() => {
        const payload = (apiClient.post as jest.Mock).mock.calls[0][1];
        expect(payload).not.toHaveProperty('confirmPassword');
        expect(payload).not.toHaveProperty('agreeToTerms');
      });
    });

    test('shows loading state while submitting', async () => {
      // make the API call hang so we can catch loading state
      (apiClient.post as jest.Mock).mockImplementation(() => new Promise(() => {}));
      const user = userEvent.setup();
      render(<CitizenRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

      await fillForm(user);
      await user.click(screen.getByRole('button', { name: /create citizen account/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
      });
    });
  });

  // ── Failed submission ─────────────────────────────────────────────────────
  describe('failed submission', () => {
    test('shows API error message on failure', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce(
        new Error('Email already registered')
      );
      const user = userEvent.setup();
      render(<CitizenRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

      await fillForm(user);
      await user.click(screen.getByRole('button', { name: /create citizen account/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/email already registered/i);
      });
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    test('shows generic error when API gives no message', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error());
      const user = userEvent.setup();
      render(<CitizenRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

      await fillForm(user);
      await user.click(screen.getByRole('button', { name: /create citizen account/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/registration failed/i);
      });
    });
  });
});