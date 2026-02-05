// types/auth.types.ts
import type { BaseUser } from './base.types';

export interface User extends BaseUser {
  lastLogin?: string;
  metadata?: Record<string, any>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken?: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'citizen' | 'volunteer' | 'admin' | null;
  phone?: string;
  agreeToTerms: boolean;
  profilePic?: string;
  extra?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    skills?: string[];
    experience?: string;
    availability?: string[];
    organization?: string;
    govId?: string;
    bio?: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
  requiresVerification?: boolean;
}

export interface UserRegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'citizen' | 'volunteer' | 'admin';
  agreeToTerms: boolean;
  receiveUpdates?: boolean;
}

export interface CitizenRegistrationData extends UserRegistrationData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  emergencyContact?: string;
}

export interface VolunteerRegistrationData extends UserRegistrationData {
  skills: string[];
  availability: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  bio?: string;
  certifications?: string[];
  vehicleAvailable?: boolean;
  backgroundCheckConsent: boolean;
}

export interface AdminRegistrationData extends UserRegistrationData {
  department: string;
  employeeId: string;
  adminLevel: 'moderator' | 'supervisor' | 'administrator';
  securityClearance: 'basic' | 'elevated' | 'high';
  supervisorEmail?: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceType: 'web' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  ip?: string;
  location?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerificationRequest {
  email: string;
  type: 'email' | 'phone';
}

export interface VerificationConfirm {
  token: string;
  code: string;
}

export interface SessionInfo {
  id: string;
  device: DeviceInfo;
  createdAt: string;
  lastActive: string;
  ip: string;
  location?: string;
}

export interface AuthPreferences {
  rememberMe: boolean;
  autoLogin: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
}