import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../app/store/hooks';
import { setUser, clearUser } from '../../../app/store/slices/authSlice';
import storageService from '../../../services/storageService';
import { authApi } from '../../../services/api/endpoints';

export const useSession = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setError(null);
      const token = storageService.getAuthToken();
      const userRole = storageService.getUserRole();
      const userData = storageService.getUserData();

      if (token && userRole && userData) {
        // Verify session by getting current user data
        const currentUser = await authApi.getCurrentUser();
        
        if (currentUser) {
          // Update storage with fresh user data
          storageService.setUserData(currentUser);
          storageService.setUserRole(currentUser.role);
          
          dispatch(setUser({ 
            role: currentUser.role,
            user: currentUser, 
            token 
          }));
        } else {
          throw new Error('Invalid user data');
        }
      } else {
        // Clear invalid or incomplete session data
        clearSession();
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setError('Session validation failed');
      clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = () => {
    storageService.clearAuth();
    dispatch(clearUser());
    setError(null);
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      setError(null);
      const token = storageService.getAuthToken();
      
      if (!token) {
        return false;
      }

      // Get fresh user data to refresh session
      const currentUser = await authApi.getCurrentUser();
      
      if (currentUser) {
        // Update storage with fresh data
        storageService.setUserData(currentUser);
        storageService.setUserRole(currentUser.role);
        
        dispatch(setUser({ 
          role: currentUser.role,
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
      const token = storageService.getAuthToken();
      if (!token) return false;

      // Simple token validation by making a lightweight API call
      await authApi.getCurrentUser();
      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  };

  const updateUserData = async (): Promise<void> => {
    try {
      const currentUser = await authApi.getCurrentUser();
      if (currentUser) {
        storageService.setUserData(currentUser);
        dispatch(setUser({
          role: currentUser.role,
          user: currentUser,
          token: storageService.getAuthToken() || ''
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