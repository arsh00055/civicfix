import { User } from '@/types/auth.types';
export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface RegistrationFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  skills?: string;
  experience?: string;
}

export interface LoginFormValidationResult {
  isValid: boolean;
  errors: LoginFormErrors;
}

export interface RegistrationFormValidationResult {
  isValid: boolean;
  errors: RegistrationFormErrors;
}

export const validateLoginForm = (email: string, password: string): LoginFormValidationResult => {
  const errors: LoginFormErrors = {};

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRegistrationForm = (
  formData: Record<string, any>, 
  role: string
): RegistrationFormValidationResult => {
  const errors: RegistrationFormErrors = {};

  // Common fields validation
  if (!formData.name?.trim()) {
    errors.name = 'Full name is required';
  } else if (formData.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)\.]/g, ''))) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors.password = 'Password must contain uppercase, lowercase letters and a number';
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Role-specific validation
  if (!role) {
    errors.role = 'Role is required';
  }

  if (role === 'volunteer') {
    if (!formData.skills?.trim()) {
      errors.skills = 'Skills are required for volunteers';
    }

    if (formData.experience && isNaN(Number(formData.experience))) {
      errors.experience = 'Experience must be a number';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const hasPermission = (user: User | null, requiredRole: string): boolean => {
  if (!user) return false;
  
  const roleHierarchy: Record<string, number> = {
    citizen: 1,
    volunteer: 2,
    admin: 3
  };

  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
};

export const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    citizen: 'Citizen',
    volunteer: 'Community Volunteer',
    admin: 'Administrator'
  };

  return roleNames[role] || 'User';
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const formatRoleForDisplay = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
};

export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('At least one lowercase letter');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('At least one uppercase letter');

  if (/\d/.test(password)) score += 1;
  else feedback.push('At least one number');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('At least one special character');

  return {
    isValid: score >= 4,
    score,
    feedback: feedback.length > 0 ? feedback : ['Strong password!']
  };
};

export const generateRandomPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};