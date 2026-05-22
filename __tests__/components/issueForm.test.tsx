/**
 * @jest-environment jsdom
 */
jest.mock('sonner', () => ({
  toast: { 
    error: jest.fn(), 
    success: jest.fn(), 
    info: jest.fn() 
  }
}));

jest.mock('@heroicons/react/24/outline', () => ({
  PhotoIcon: () => <svg data-testid="photo-icon" />,
  XMarkIcon: () => <svg data-testid="x-icon" />,
}));

jest.mock('@/components/UI/buttons/PrimaryButton', () => ({
  __esModule: true,
  default: ({ children, disabled, type, onClick }: any) => (
    <button
      type={type || 'button'}
      disabled={disabled}
      onClick={onClick}
      data-testid="continue-button"
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/UI/forms/InputField', () => ({
  __esModule: true,
  default: ({ label, value, onChange, placeholder, required }: any) => (
    <div data-testid={`input-${label.toLowerCase()}`}>
      <label>{label}</label>
      <input
        aria-label={label}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  ),
}));

jest.mock('@/components/UI/forms/SelectField', () => ({
  __esModule: true,
  default: ({ label, value, onChange, options, placeholder }: any) => (
    <div data-testid={`select-${label.toLowerCase()}`}>
      <label>{label}</label>
      <select 
        aria-label={label} 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options?.map((o: any) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  ),
}));

import { toast } from 'sonner';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IssueForm from '@/app/issues/new/components/IssueForm';
 
const DEFAULT_FORM = {
  title: '', description: '', category: '', priority: 'medium', location: '', images: [],
};
 
describe('IssueForm', () => {
  const mockOnUpdate = jest.fn();
  const mockOnNext   = jest.fn();
 
  beforeEach(() => jest.clearAllMocks());
 
  describe('rendering', () => {
    test('renders all required fields', () => {
      render(<IssueForm formData={DEFAULT_FORM} onUpdate={mockOnUpdate} onNext={mockOnNext} />);
      expect(screen.getByPlaceholderText(/briefly describe/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/provide detailed/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/main street/i)).toBeInTheDocument();
    });
 
    test('renders continue button', () => {
      render(<IssueForm formData={DEFAULT_FORM} onUpdate={mockOnUpdate} onNext={mockOnNext} />);
      expect(screen.getByRole('button', { name: /continue to location/i })).toBeInTheDocument();
    });
 
    test('shows image count', () => {
      render(<IssueForm formData={DEFAULT_FORM} onUpdate={mockOnUpdate} onNext={mockOnNext} />);
      expect(screen.getByText(/0\/5/)).toBeInTheDocument();
    });
  });
 
  describe('field updates', () => {
    test('calls onUpdate when title changes', async () => {
      const user = userEvent.setup();
      render(<IssueForm formData={DEFAULT_FORM} onUpdate={mockOnUpdate} onNext={mockOnNext} />);
 
      await user.type(screen.getByPlaceholderText(/briefly describe/i), 'Pothole');
      expect(mockOnUpdate).toHaveBeenCalledWith({ title: expect.stringContaining('P') });
    });
 
    test('calls onUpdate when category changes', async () => {
      const user = userEvent.setup();
      render(<IssueForm formData={DEFAULT_FORM} onUpdate={mockOnUpdate} onNext={mockOnNext} />);
 
      await user.selectOptions(screen.getByLabelText(/category/i), 'safety');
      expect(mockOnUpdate).toHaveBeenCalledWith({ category: 'safety' });
    });
 
    test('calls onUpdate when priority changes', async () => {
      const user = userEvent.setup();
      render(<IssueForm formData={DEFAULT_FORM} onUpdate={mockOnUpdate} onNext={mockOnNext} />);
 
      await user.selectOptions(screen.getByLabelText(/priority/i), 'high');
      expect(mockOnUpdate).toHaveBeenCalledWith({ priority: 'high' });
    });
  });
 
  describe('form submission', () => {
    test('calls onNext when all required fields are filled', async () => {
      const user = userEvent.setup();
      const filledForm = {
        ...DEFAULT_FORM,
        title: 'Pothole', description: 'Big hole', category: 'infrastructure', location: 'Main St',
      };
      render(<IssueForm formData={filledForm} onUpdate={mockOnUpdate} onNext={mockOnNext} />);
 
      await user.click(screen.getByRole('button', { name: /continue to location/i }));
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
 
    test('does not call onNext when required fields are empty', async () => {
      const user = userEvent.setup();
      render(<IssueForm formData={DEFAULT_FORM} onUpdate={mockOnUpdate} onNext={mockOnNext} />);
      await user.click(screen.getByRole('button', { name: /continue to location/i }));
      expect(mockOnNext).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields');
    });
  });
 
  describe('image upload button', () => {
    test('upload button is disabled when userId is not provided', () => {
      render(<IssueForm formData={DEFAULT_FORM} onUpdate={mockOnUpdate} onNext={mockOnNext} userId={undefined} />);
      const uploadBtn = screen.getByRole('button', { name: /upload images/i });
      expect(uploadBtn).toBeDisabled();
    });
 
    test('upload button is enabled when userId is provided', () => {
      render(<IssueForm formData={DEFAULT_FORM} onUpdate={mockOnUpdate} onNext={mockOnNext} userId="user-1" />);
      const uploadBtn = screen.getByRole('button', { name: /upload images/i });
      expect(uploadBtn).not.toBeDisabled();
    });
 
    test('upload button is disabled when 5 images already uploaded', () => {
      const formWithImages = { ...DEFAULT_FORM, images: ['a', 'b', 'c', 'd', 'e'] };
      render(<IssueForm formData={formWithImages} onUpdate={mockOnUpdate} onNext={mockOnNext} userId="user-1" />);
      expect(screen.getByRole('button', { name: /upload images/i })).toBeDisabled();
    });
  });
});