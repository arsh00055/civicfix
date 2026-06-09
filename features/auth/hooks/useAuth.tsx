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
      // Strip undefined values so they don't overwrite good data in storage
      const cleanUser = Object.fromEntries(
        Object.entries(userData).filter(([_, v]) => v !== undefined)
      ) as User;
  
      const userDataStr = JSON.stringify(cleanUser);
  
      setUserState(cleanUser);
      setUserRole(cleanUser.role);
  
      Cookies.set('auth_token', authToken, COOKIE_CONFIG);
      Cookies.set('user_role', cleanUser.role, COOKIE_CONFIG);
      Cookies.set('user_data', userDataStr, COOKIE_CONFIG);
  
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user_role', cleanUser.role);
        localStorage.setItem('user_data', userDataStr);
      }
  
      dispatch(setUser({ user: cleanUser, token: authToken, role: cleanUser.role }));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally mount-only — initializeAuth reads storage once
  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (
    email: string,
    password: string,
    role: string,
    additionalData?: any
  ) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

      const response = await fetch(`${baseUrl}/api/auth/login`, {
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
      
      // Handle different response structures
      let u;
      if (response.data?.user) {
        u = response.data.user;
      } else if (response.user) {
        u = response.user;
      } else if (response.data) {
        u = response.data;
      } else {
        u = response;
      }
      
      if (!u) {
        throw new Error('Failed to refresh user — no user data in response');
      }
      
      if (!response.success && response.success !== undefined) {
        throw new Error('Failed to refresh user — API returned success: false');
      }
      
      const existingUser = user;
      
      const formattedUser: User = {
        ...existingUser,
        id:              u.id || u._id,
        _id:             u.id || u._id,
        firstName:       u.firstName       ?? existingUser?.firstName       ?? '',
        lastName:        u.lastName        ?? existingUser?.lastName        ?? '',
        name:            u.name            ?? existingUser?.name            ?? '',
        email:           u.email           ?? existingUser?.email           ?? '',
        role:            u.role            ?? existingUser?.role,
        avatar:          u.avatar          ?? existingUser?.avatar          ?? null,
        phone:           u.phone           ?? existingUser?.phone           ?? null,
        bio:             u.bio             ?? existingUser?.bio             ?? null,
        city:            u.city            ?? existingUser?.city            ?? null,
        address:         u.address         ?? existingUser?.address         ?? null,
        state:           u.state           ?? existingUser?.state           ?? null,
        zipCode:         u.zipCode         ?? existingUser?.zipCode         ?? null,
        isActive:        u.isActive        ?? existingUser?.isActive,
        isEmailVerified: u.isEmailVerified ?? existingUser?.isEmailVerified,
        createdAt:       u.createdAt       ?? existingUser?.createdAt,
        updatedAt:       u.updatedAt       ?? existingUser?.updatedAt,
        isVerified:      u.isEmailVerified ?? existingUser?.isVerified,
        skills:          u.skills          ?? existingUser?.skills,
        availability:    u.availability    ?? existingUser?.availability,
        experienceLevel: u.experienceLevel ?? existingUser?.experienceLevel,
        approvalStatus:  u.approvalStatus  ?? existingUser?.approvalStatus,
        department:      u.department      ?? existingUser?.department,
        permissions:     u.permissions     ?? existingUser?.permissions,
      } as User;
      
      const existingToken =
        Cookies.get('auth_token') ||
        (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '') ||
        '';
      
      updateAuthState(formattedUser, existingToken);
    } catch (error) {
      console.error('Refresh user failed:', error);
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