import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

jest.mock('@/lib/services/api/client', () => ({
    __esModule: true,
    default: { post: jest.fn() }
}));
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

jest.mock('@/components/UI/forms/RHFInputField', () => ({
  __esModule: true,
  default: ({ label, type, registration, error, placeholder }: any) => (
    <div>
      <label htmlFor={registration?.name}>{label}</label>
      <input
        id={registration?.name}
        type={type === 'email' ? 'text' : type || 'text'}
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
  default: ({ children, disabled, type }: any) => (
    <button type={type} disabled={disabled}>{children}</button>
  ),
}));

import apiClient from '@/lib/services/api/client';
import VolunteerRegistration from '@/app/(auth)/register/components/VolunteerRegistration';

const mockPush      = jest.fn();
const mockOnSuccess = jest.fn();
const mockOnSwitch  = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

async function fillVolunteerForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: any = {}
) {
  const data = {
    firstName: 'Arshdeep',
    lastName: 'Singh',
    email: 'arshdeep@test.com',
    password: 'Test1234!',
    confirmPassword: 'Test1234!',
    ...overrides,
  };

  await user.type(
    screen.getByPlaceholderText(/first name/i),
    data.firstName
  );

  await user.type(
    screen.getByPlaceholderText(/last name/i),
    data.lastName
  );

  await user.type(
    screen.getByPlaceholderText(/email/i),
    data.email
  );

  await user.type(
    screen.getByPlaceholderText(/at least 8/i),
    data.password
  );

  await user.type(
    screen.getByPlaceholderText(/confirm/i),
    data.confirmPassword
  );

  // Select ONE skill
  await user.click(screen.getByLabelText(/cleaning/i));

  // Select ONE availability
  await user.click(screen.getByLabelText(/weekdays/i));

  // Select experience level
  await user.selectOptions(
    screen.getByRole('combobox'),
    'beginner'
  );

  // Agree to terms
  await user.click(
    screen.getByLabelText(/i agree to the/i)
  );
}

describe('VolunteerRegistration', () => {

  describe('rendering', () => {
    test('shows volunteer registration heading', () => {
      render(<VolunteerRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitch} />);
      expect((screen.getAllByText(/Become a Volunteer/i))[0]).toBeInTheDocument();
    });

    test('renders name, email, password fields', () => {
      render(<VolunteerRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitch} />);
      expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/at least 8/i)).toBeInTheDocument();
    });

    test('renders skills section', () => {
      render(<VolunteerRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitch} />);
      expect((screen.getAllByText(/skills/i))[0]).toBeInTheDocument();
    });

    test('renders experience level dropdown', () => {
      render(<VolunteerRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitch} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    test('renders register button', () => {
      render(<VolunteerRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitch} />);
      expect(
        screen.getByRole('button', { name: /Become a Volunteer/i })
      ).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    test('shows errors on empty submit', async () => {
      const user = userEvent.setup();
      render(<VolunteerRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitch} />);
      await user.click(screen.getByRole('button', { name: /Become a Volunteer/i }));
      await waitFor(() => {
        expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
      });
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    test('shows error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<VolunteerRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitch} />);
      await fillVolunteerForm(user, { confirmPassword: 'WrongPass!' });
      await user.click(screen.getByRole('button', { name: /Become a Volunteer/i }));
      await waitFor(() => {
        expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
      });
    });

    test('shows error for short password', async () => {
      const user = userEvent.setup();
      render(<VolunteerRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitch} />);
      await fillVolunteerForm(user, { password: 'short', confirmPassword: 'short' });
      await user.click(screen.getByRole('button', { name: /Become a Volunteer/i }));
      await waitFor(() => {
        expect(screen.getByText(/at least 8/i)).toBeInTheDocument();
      });
    });
  });

  describe('successful submission', () => {
    test('calls apiClient.post with volunteer data', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: { success: true, data: { approvalStatus: 'pending' } },
      });
      const user = userEvent.setup();
      render(<VolunteerRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitch} />);
      await fillVolunteerForm(user);
      await user.click(screen.getByRole('button', { name: /Become a Volunteer/i }));
      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          expect.stringContaining('volunteer'),
          expect.objectContaining({
            firstName: 'Arshdeep',
            lastName:  'Singh',
            email:     'arshdeep@test.com',
          })
        );
      });
    });

    test('shows pending approval message after registration', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: { success: true, message: 'Submitted for approval' },
      });
      const user = userEvent.setup();
      render(<VolunteerRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitch} />);
      await fillVolunteerForm(user);
      await user.click(screen.getByRole('button', { name: /Become a Volunteer/i }));
      await waitFor(() => {
        expect(
          screen.getByText(/pending.*approval|submitted.*approval|admin.*review/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('API errors', () => {
    test('shows duplicate email error', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce(
        new Error('Email already registered as citizen.')
      );
      const user = userEvent.setup();
      render(<VolunteerRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitch} />);
      await fillVolunteerForm(user);
      await user.click(screen.getByRole('button', { name: /Become a Volunteer/i }));
      await waitFor(() => {
        expect(screen.getByText(/already registered/i)).toBeInTheDocument();
      });
    });

    test('shows registration closed error', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce(
        new Error('Volunteer registration is currently closed.')
      );
      const user = userEvent.setup();
      render(<VolunteerRegistration onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitch} />);
      await fillVolunteerForm(user);
      await user.click(screen.getByRole('button', { name: /Become a Volunteer/i }));
      await waitFor(() => {
        expect((screen.getAllByText(/Volunteer registration is currently closed/i))[0]).toBeInTheDocument();
      });
    });
  });
});