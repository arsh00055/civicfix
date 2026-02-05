'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/lib/store/hooks';
import { setUser, clearUser } from '@/lib/store/slices/authSlice';
import Cookies from 'js-cookie';
import { authService } from '@/lib/services/api/authService';
import { User } from '@/types/user.types';

interface UseSessionReturn {
  isLoading: boolean;
  error: string | null;
  refreshSession: () => Promise<boolean>;
  clearSession: () => void;
  validateSession: () => Promise<boolean>;
  updateUserData: () => Promise<void>;
}

export const useSession = (): UseSessionReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const getStoredUser = (): User | null => {
    const userData = Cookies.get('user_data');
    return userData ? JSON.parse(userData) : null;
  };

  const getStoredToken = (): string | null => {
    return Cookies.get('auth_token') || null;
  };

  const getStoredRole = (): string | null => {
    return Cookies.get('user_role') || null;
  };

  const checkSession = useCallback(async () => {
    try {
      setError(null);
      const token = getStoredToken();
      const userRole = getStoredRole();
      const userData = getStoredUser();

      if (!token || !userRole || !userData) {
        clearSession();
        return;
      }

      // Verify session by getting current user data
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser && currentUser.id === userData.id) {
        // Update storage with fresh user data
        Cookies.set('user_data', JSON.stringify(currentUser), {
          expires: 1,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        
        dispatch(setUser({ 
          user: currentUser,
          token 
        }));
      } else {
        throw new Error('Session validation failed');
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setError('Session validation failed');
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const clearSession = () => {
    Cookies.remove('auth_token', { path: '/' });
    Cookies.remove('user_role', { path: '/' });
    Cookies.remove('user_data', { path: '/' });
    dispatch(clearUser());
    setError(null);
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      setError(null);
      const token = getStoredToken();
      
      if (!token) {
        return false;
      }

      // Get fresh user data to refresh session
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        // Update storage with fresh data
        Cookies.set('user_data', JSON.stringify(currentUser), {
          expires: 1,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        
        dispatch(setUser({ 
          user: currentUser,
          token 
        }));
        return true;
      } else {
        throw new Error('Failed to refresh user data');
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      setError('Session refresh failed');
      clearSession();
      return false;
    }
  };

  const validateSession = async (): Promise<boolean> => {
    try {
      const token = getStoredToken();
      if (!token) return false;

      // Simple token validation by making a lightweight API call
      const user = await authService.getCurrentUser();
      return !!user;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  };

  const updateUserData = async (): Promise<void> => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        Cookies.set('user_data', JSON.stringify(currentUser), {
          expires: 1,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        
        dispatch(setUser({
          user: currentUser,
          token: getStoredToken() || ''
        }));
      }
    } catch (error) {
      console.error('Failed to update user data:', error);
      throw error;
    }
  };

  return {
    isLoading,
    error,
    refreshSession,
    clearSession,
    validateSession,
    updateUserData
  };
};