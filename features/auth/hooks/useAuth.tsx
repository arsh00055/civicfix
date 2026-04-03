'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setUser, clearUser, setLoading } from '@/lib/store/slices/authSlice'; // removed unused setToken
import { authApi } from '@/lib/services/api/endpoints';
import { User } from '@/types/auth.types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userRole: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role: string, additionalData?: any) => Promise<any>;
  register: (data: any, role: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_CONFIG = {
  expires: 1,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: storeUser, token: storeToken, isLoading: storeLoading } = useAppSelector(
    (state) => state.auth
  );

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUserState] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'citizen' | 'volunteer' | 'admin' | null>(null);

  // ── Single writer ────────────────────────────────────────────────────────
  const updateAuthState = useCallback(
    (userData: User, authToken: string) => {
      const userDataStr = JSON.stringify(userData);

      setUserState(userData);
      setUserRole(userData.role);

      Cookies.set('auth_token', authToken, COOKIE_CONFIG);
      Cookies.set('user_role', userData.role, COOKIE_CONFIG);
      Cookies.set('user_data', userDataStr, COOKIE_CONFIG);

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user_role', userData.role);
        localStorage.setItem('user_data', userDataStr);
      }

      dispatch(setUser({ user: userData, token: authToken, role: userData.role }));
    },
    [dispatch]
  );

  const clearAuthStorage = useCallback(() => {
    Cookies.remove('auth_token');
    Cookies.remove('user_role');
    Cookies.remove('user_data');

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_data');
    }

    setUserState(null);
    setUserRole(null);
  }, []);

  const clearAuth = useCallback(() => {
    clearAuthStorage();
    dispatch(clearUser());
    router.push('/login');
  }, [dispatch, router, clearAuthStorage]);

  // ── Initialize on mount ──────────────────────────────────────────────────
  const initializeAuth = useCallback(() => {
    try {
      const token =
        Cookies.get('auth_token') ||
        (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);

      const userDataStr =
        Cookies.get('user_data') ||
        (typeof window !== 'undefined' ? localStorage.getItem('user_data') : null);

      const role =
        Cookies.get('user_role') ||
        (typeof window !== 'undefined' ? localStorage.getItem('user_role') : null);

      if (token && userDataStr) {
        const parsedUser = JSON.parse(userDataStr);
        setUserState(parsedUser);
        setUserRole(parsedUser.role || role);

        if (!storeUser || storeUser.id !== parsedUser.id) {
          dispatch(setUser({ user: parsedUser, token, role: parsedUser.role }));
        }
      } else if (storeUser && storeToken) {
        setUserState(storeUser as unknown as User);
        setUserRole(storeUser.role);
        updateAuthState(storeUser as unknown as User, storeToken);
      }
    } catch {
      // Corrupted storage — wipe it and force re-login
      clearAuthStorage();
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  }, [dispatch, storeUser, storeToken, updateAuthState, clearAuthStorage]);

  useEffect(() => {
    initializeAuth();
  }, []);
  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (
    email: string,
    password: string,
    role: string,
    additionalData?: any
  ) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, securityKey: additionalData?.securityKey }),
      });

      const data = await response.json();

      if (!data.success) return data;

      updateAuthState(data.data.user, data.data.token);

      setTimeout(() => {
        switch (role) {
          case 'admin':     router.push('/admin');     break;
          case 'volunteer': router.push('/volunteer'); break;
          default:          router.push('/citizen');
        }
      }, 100);

      return data;
    } catch (error: any) {
      return { success: false, message: error?.message || 'Network error. Please try again.' };
    }
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const register = async (data: any, role: string) => {
    setIsLoading(true);
    dispatch(setLoading(true));

    try {
      const response = await authApi.register({ ...data, role }, role);

      if (response?.token && response?.user) {
        updateAuthState(response.user, response.token);
        setTimeout(() => {
          switch (role) {
            case 'volunteer': router.push('/volunteer'); break;
            default:          router.push('/citizen');
          }
        }, 100);
      }
    } catch (error: any) {
      throw new Error(error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors — clear local state regardless
    } finally {
      clearAuth();
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authApi.getCurrentUser();

      if (!response.success) {
        throw new Error('Failed to refresh user — API returned success: false');
      }

      const u = response.user;

      const formattedUser: User = {
        id:             u.id || u._id,
        _id:            u.id || u._id,
        firstName:      u.firstName || '',
        lastName:       u.lastName  || '',
        name:           u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        email:          u.email,
        role:           u.role,
        avatar:         u.avatar,
        phone:          u.phone,
        isActive:       u.isActive,
        isEmailVerified:u.isEmailVerified,
        createdAt:      u.createdAt,
        updatedAt:      u.updatedAt,
        isVerified:     u.isEmailVerified,
        skills:         u.skills,
        availability:   u.availability,
        experienceLevel:u.experienceLevel,
        approvalStatus: u.approvalStatus,
        department:     u.department,
        permissions:    u.permissions,
        bio:            u.bio,
        city:           u.city,
        address:        u.address,
        state:          u.state,
        zipCode:        u.zipCode,
      } as User;

      const existingToken =
        Cookies.get('auth_token') ||
        (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '') ||
        '';

      updateAuthState(formattedUser, existingToken);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (storeUser && !user) {
      setUserState(storeUser as unknown as User);
      setUserRole(storeUser.role);
    }
  }, [storeUser, user]);

  const value: AuthContextType = {
    isAuthenticated: !!user || !!Cookies.get('auth_token'),
    user,
    userRole,
    isLoading: isLoading || storeLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};