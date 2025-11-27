import type { UserProfile } from './user.types';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'citizen' | 'volunteer' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: UserProfile['preferences'];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  profilePic?: string;
  extra?: {
    address?: string;
    mobile?: string;
    skills?: string;
    availability?: string;
    organization?: string;
    govId?: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
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
}

export interface CitizenRegistrationData extends UserRegistrationData {
  address: string;
  city: string;
  zipCode: string;
}

export interface VolunteerRegistrationData extends UserRegistrationData {
  skills: string[];
  availability: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  bio?: string;
}

export interface AdminRegistrationData extends UserRegistrationData {
  department: string;
  employeeId: string;
  adminLevel: 'moderator' | 'supervisor' | 'administrator';
}