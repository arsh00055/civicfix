/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import CitizenLogin from '@/features/auth/components/CitizenLogin';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/features/auth/hooks/useAuth', () => ({
    useAuth: jest.fn(),
}));

const mockPush = jest.fn();
const mockLogin = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({ push : mockPush});
    (useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        isLoading: false,
        user: null,
    });
});

describe('CitizenLogin', () => {

    describe('rendering', () => {

        test('renders email and password fields', () => {
            render(<CitizenLogin />);
            expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        });

        test('renders login button', () => {
            render(<CitizenLogin />);
            expect(screen.getByRole('button', { name: /login|sign in/i })).toBeInTheDocument();
        });
      
        test('login button is not disabled initially', () => {
            render(<CitizenLogin />);
            // ✅ FIX: .disabled() is not a function — use .toBeDisabled() from jest-dom
            expect(screen.getByRole('button', { name: /login|sign in/i })).not.toBeDisabled();
        });
    })

    describe('validation', () => {

        test('shows error when submitting with empty fields', async () => {
            const user = userEvent.setup();
            render(<CitizenLogin />);
      
            await user.click(screen.getByRole('button', { name: /login|sign in/i }));
      
            await waitFor(() => {
              expect(
                screen.getByText(/email.*required|required.*email/i)
              ).toBeInTheDocument();
            });
        });

        test('shows error for invalid email format', async () => {
            const user = userEvent.setup();
            render(<CitizenLogin />);
      
            await user.type(screen.getByPlaceholderText(/email/i), 'notanemail');
            await user.type(screen.getByPlaceholderText(/password/i), 'password123');
            await user.click(screen.getByRole('button', { name: /login|sign in/i }));
      
            await waitFor(() => {
              expect(screen.getByText(/valid email|invalid email/i)).toBeInTheDocument();
            });
        });

        test('does not call login() when fields are empty', async () => {
            const user = userEvent.setup();
            render(<CitizenLogin />);
      
            await user.click(screen.getByRole('button', { name: /login|sign in/i }));
      
            expect(mockLogin).not.toHaveBeenCalled();
        });
    })

    describe('successful login', () => {

        test('calls login() with correct email, password and role', async () => {
            mockLogin.mockResolvedValueOnce({ success: true });
            const user = userEvent.setup();
            render(<CitizenLogin />);
      
            await user.type(screen.getByPlaceholderText(/email/i), 'jaspreet@test.com');
            await user.type(screen.getByPlaceholderText(/password/i), 'Test1234!');
            await user.click(screen.getByRole('button', { name: /login|sign in/i }));
      
            await waitFor(() => {
              expect(mockLogin).toHaveBeenCalledWith(
                'jaspreet@test.com',
                'Test1234!',
                'citizen',
                {}
              );
            });
        });

        test('shows loading state while login is in progress', async () => {
            mockLogin.mockImplementation(() => new Promise(() => {}));
            const user = userEvent.setup();
            render(<CitizenLogin />);
      
            await user.type(screen.getByPlaceholderText(/email/i), 'jaspreet@test.com');
            await user.type(screen.getByPlaceholderText(/password/i), 'Test1234!');
            await user.click(screen.getByRole('button', { name: /sign in/i }));
      
            await waitFor(() => {
              const btn = screen.getByRole('button', { name: /Signing in.../i });
              // ✅ FIX: .disabled() is not a function — use .toBeDisabled() from jest-dom
              expect(btn).toBeDisabled();
            });
        });
    })

    describe('failed login', () => {

        test('shows error message when login returns success: false', async () => {
            mockLogin.mockResolvedValueOnce({
              success: false,
              message: 'Invalid credentials'
            });
            const user = userEvent.setup();
            render(<CitizenLogin />);
      
            await user.type(screen.getByPlaceholderText(/email/i), 'wrong@test.com');
            await user.type(screen.getByPlaceholderText(/password/i), 'wrongpassword');
            await user.click(screen.getByRole('button', { name: /login|sign in/i }));
      
            await waitFor(() => {
              expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
            });
        });

        test('shows generic error when network fails', async () => {
            mockLogin.mockRejectedValueOnce(new Error('Network error'));
            const user = userEvent.setup();
            render(<CitizenLogin />);
      
            await user.type(screen.getByPlaceholderText(/email/i), 'jaspreet@test.com');
            await user.type(screen.getByPlaceholderText(/password/i), 'Test1234!');
            await user.click(screen.getByRole('button', { name: /login|sign in/i }));
      
            await waitFor(() => {
              expect(
                screen.getByText(/network error|something went wrong|try again/i)
              ).toBeInTheDocument();
            });
        });
    })

    describe('password visibility', () => {

        test('password is hidden by default', () => {
            render(<CitizenLogin />);
            expect(screen.getByPlaceholderText(/password/i)).toHaveAttribute('type', 'password');
        });

        test('clicking show password toggles input type', async () => {
            const user = userEvent.setup();
            render(<CitizenLogin />);
      
            const passwordInput = screen.getByPlaceholderText(/password/i);
            expect(passwordInput).toHaveAttribute('type', 'password');
      
            const toggleBtn = screen.getByRole('button', { name: /show password|toggle password/i });
            await user.click(toggleBtn);
      
            expect(passwordInput).toHaveAttribute('type', 'text');
        });
    })
})