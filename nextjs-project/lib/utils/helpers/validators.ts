import { AUTH_CONFIG, VALIDATION } from '../constants/constants';

export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < VALIDATION.PASSWORD_MIN) {
    return { 
      isValid: false, 
      message: `Password must be at least ${VALIDATION.PASSWORD_MIN} characters long` 
    };
  }

  if (password.length > VALIDATION.PASSWORD_MAX) {
    return { 
      isValid: false, 
      message: `Password must be less than ${VALIDATION.PASSWORD_MAX} characters` 
    };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  if (!AUTH_CONFIG.PASSWORD_REGEX.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one special character (@$!%*?&)' 
    };
  }

  return { isValid: true };
};

export const isValidName = (name: string): { isValid: boolean; message?: string } => {
  if (!name) {
    return { isValid: false, message: 'Name is required' };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length < VALIDATION.USERNAME_MIN) {
    return { 
      isValid: false, 
      message: `Name must be at least ${VALIDATION.USERNAME_MIN} characters long` 
    };
  }

  if (trimmedName.length > VALIDATION.USERNAME_MAX) {
    return { 
      isValid: false, 
      message: `Name must be less than ${VALIDATION.USERNAME_MAX} characters` 
    };
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { 
      isValid: false, 
      message: 'Name can only contain letters, spaces, hyphens, and apostrophes' 
    };
  }

  return { isValid: true };
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  
  // Remove all non-digit characters except plus sign
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check if it's a valid phone number format
  // Supports: +1234567890, 1234567890, 123-456-7890, (123) 456-7890
  const phoneRegex = /^\+?[\d\s-()]{10,15}$/;
  
  // Count digits to ensure proper length
  const digitCount = cleaned.replace(/\D/g, '').length;
  
  return phoneRegex.test(phone) && digitCount >= 10 && digitCount <= 15;
};

export const isValidImageFile = (file: File): { isValid: boolean; message?: string } => {
  if (!file) {
    return { isValid: false, message: 'Please select a file' };
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      message: 'Please select a valid image file (JPEG, PNG, GIF, WebP, SVG)',
    };
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      message: 'Image size must be less than 5MB',
    };
  }

  return { isValid: true };
};

export const isValidFileUpload = (
  files: File[], 
  maxFiles: number = 5, 
  maxTotalSize: number = 20 * 1024 * 1024
): { isValid: boolean; message?: string } => {
  if (!files || files.length === 0) {
    return { isValid: true }; // No files is valid
  }

  if (files.length > maxFiles) {
    return {
      isValid: false,
      message: `Maximum ${maxFiles} files allowed`,
    };
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > maxTotalSize) {
    return {
      isValid: false,
      message: `Total file size must be less than ${maxTotalSize / (1024 * 1024)}MB`,
    };
  }

  for (const file of files) {
    const imageValidation = isValidImageFile(file);
    if (!imageValidation.isValid) {
      return imageValidation;
    }
  }

  return { isValid: true };
};

export const isValidURL = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isValidDate = (date: string | Date): boolean => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
};

export const isFutureDate = (date: string | Date): boolean => {
  if (!isValidDate(date)) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
};

export const isPastDate = (date: string | Date): boolean => {
  if (!isValidDate(date)) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
};

export const isValidAge = (birthDate: string | Date, minAge: number = 18): boolean => {
  if (!isValidDate(birthDate)) return false;
  
  const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  const age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    return age - 1 >= minAge;
  }
  
  return age >= minAge;
};

export const isValidGovId = (id: string): boolean => {
  if (!id) return false;
  
  // Remove whitespace and special characters
  const cleaned = id.replace(/\s/g, '');
  
  // Check if it's a valid format (adjust based on country requirements)
  // This is a generic validation - you should customize for your region
  const govIdRegex = /^[A-Z0-9]{5,20}$/i;
  
  return govIdRegex.test(cleaned) && cleaned.length >= 5 && cleaned.length <= 20;
};

export const validateIssueForm = (data: {
  title: string;
  description: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length < VALIDATION.TITLE_MIN) {
    errors.title = `Title must be at least ${VALIDATION.TITLE_MIN} characters long`;
  } else if (data.title.length > VALIDATION.TITLE_MAX) {
    errors.title = `Title must be less than ${VALIDATION.TITLE_MAX} characters`;
  }

  // Description validation
  if (!data.description?.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.length < VALIDATION.DESCRIPTION_MIN) {
    errors.description = `Description must be at least ${VALIDATION.DESCRIPTION_MIN} characters long`;
  } else if (data.description.length > VALIDATION.DESCRIPTION_MAX) {
    errors.description = `Description must be less than ${VALIDATION.DESCRIPTION_MAX} characters`;
  }

  // Category validation
  if (!data.category) {
    errors.category = 'Category is required';
  }

  // Location validation
  if (!data.location?.trim()) {
    errors.location = 'Location description is required';
  } else if (data.location.length < VALIDATION.LOCATION_MIN) {
    errors.location = `Location must be at least ${VALIDATION.LOCATION_MIN} characters long`;
  } else if (data.location.length > VALIDATION.LOCATION_MAX) {
    errors.location = `Location must be less than ${VALIDATION.LOCATION_MAX} characters`;
  }

  // Coordinates validation
  if (data.latitude === undefined || data.longitude === undefined) {
    errors.location = 'Please select a location on the map';
  } else {
    if (isNaN(data.latitude) || data.latitude < -90 || data.latitude > 90) {
      errors.latitude = 'Invalid latitude value';
    }
    if (isNaN(data.longitude) || data.longitude < -180 || data.longitude > 180) {
      errors.longitude = 'Invalid longitude value';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRegistrationForm = (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  role: string;
  govId?: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Name validation
  const nameValidation = isValidName(data.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message || 'Invalid name';
  }

  // Email validation
  if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  const passwordValidation = isValidPassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message || 'Invalid password';
  }

  // Confirm password validation
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Phone validation (optional)
  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  // Role validation
  if (!data.role) {
    errors.role = 'Please select a role';
  }

  // Government ID validation (for volunteers)
  if (data.role === 'volunteer' && data.govId && !isValidGovId(data.govId)) {
    errors.govId = 'Please enter a valid government ID';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateAddress = (address: {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!address.street?.trim()) {
    errors.street = 'Street address is required';
  }

  if (!address.city?.trim()) {
    errors.city = 'City is required';
  }

  if (!address.state?.trim()) {
    errors.state = 'State/Province is required';
  }

  if (!address.zipCode?.trim()) {
    errors.zipCode = 'ZIP/Postal code is required';
  } else if (!/^\d{5,10}$/.test(address.zipCode.replace(/\s/g, ''))) {
    errors.zipCode = 'Please enter a valid ZIP/Postal code';
  }

  if (!address.country?.trim()) {
    errors.country = 'Country is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRange = (
  value: number, 
  min: number, 
  max: number
): { isValid: boolean; message?: string } => {
  if (value < min) {
    return { isValid: false, message: `Value must be at least ${min}` };
  }

  if (value > max) {
    return { isValid: false, message: `Value must be at most ${max}` };
  }

  return { isValid: true };
};