'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setUser, clearUser } from '@/lib/store/slices/authSlice';
import { authApi } from '@/lib/services/api/endpoints';
import { User } from '@/types/auth.types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userRole: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role: string, additionalData?: any) => Promise<void>;
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
  const { user: storeUser, token } = useAppSelector((state) => state.auth);
  
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUserState] = useState<User | null>(
    storeUser &&
    'isActive' in storeUser &&
    'isVerified' in storeUser &&
    'createdAt' in storeUser &&
    'updatedAt' in storeUser
      ? storeUser as User
      : null
  );
  const [userRole, setUserRole] = useState<string | null>(storeUser && 'role' in storeUser ? (storeUser as any).role : null);

  const checkAuthStatus = useCallback(async () => {
    try {
      const storedToken = Cookies.get('auth_token');
      
      if (!storedToken) {
        clearAuthState();
        setIsLoading(false);
        return;
      }

      // If we have token but no user data, fetch it
      if (storedToken && !storeUser) {
        const userData = await authApi.getCurrentUser();
        if (userData) {
          updateAuthState(userData, storedToken);
        } else {
          clearAuth();
        }
      } else if (storeUser) {
        const requiredFields = ['isActive', 'isVerified', 'createdAt', 'updatedAt'];
        const hasRequiredFields = requiredFields.every((field) => field in (storeUser ?? {}));
        if (hasRequiredFields) {
          setUserState(storeUser as unknown as User);
          setUserRole((storeUser as any).role ?? null);
        } else {
          setUserState(null);
          setUserRole(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, [storeUser]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const updateAuthState = (userData: User, authToken: string) => {
    setUserState(userData);
    setUserRole(userData.role);
    
    Cookies.set('auth_token', authToken, COOKIE_CONFIG);
    Cookies.set('user_role', userData?.role, COOKIE_CONFIG);
    Cookies.set('user_data', JSON.stringify(userData), COOKIE_CONFIG);
    
    dispatch(setUser({ 
      user: userData,
      token: authToken
    }));
  };

  const clearAuthState = () => {
    setUserState(null);
    setUserRole(null);
    dispatch(clearUser());
  };

  const clearAuth = useCallback(() => {
    Cookies.remove('auth_token');
    Cookies.remove('user_role');
    Cookies.remove('user_data');
    clearAuthState();
    router.push('/login');
  }, [router]);

  const login = async (email: string, password: string, role: string, additionalData?: any) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password, role, ...additionalData });
      
      const responseData = response;
      console.log('Login response:', responseData);

      if (responseData && responseData.token && responseData.user) {
        updateAuthState(responseData.user, responseData.token);

        switch (role) {
          case 'admin':
            router.push('/admin');
            break;
          case 'volunteer':
            router.push('/volunteer');
            break;
          case 'citizen':
          default:
            router.push('/citizen');
            break;
        }
      } else {
        console.error('❌ Invalid response structure:', {
          response,
          responseData,
          hasToken: responseData?.token,
          hasUser: responseData?.user
        });
        throw new Error('Invalid response from server: Missing token or user data');
      }
    } catch (error: any) {
      console.error('Login error details:', {
        error,
        message: error.message,
        stack: error.stack
      });

      // if (process.env.NODE_ENV !== 'production') {
      //   await mockLoginFallback(email, password, role);
      //   return;
      // }
      
      throw new Error(error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const mockLoginFallback = async (email: string, password: string, role: string) => {
    const mockToken = `mock-token-${Date.now()}`;
    const mockUser: User = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: role as any,
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phone: '+1234567890',
      isActive: false,
      isVerified: false
    };

    updateAuthState(mockUser, mockToken);
    
    switch (role) {
      case 'admin':
        router.push('/admin/analytics');
        break;
      case 'volunteer':
        router.push('/volunteer');
        break;
      case 'citizen':
      default:
        router.push('/citizen');
    }
  };

  const register = async (data: any, role: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({ ...data, role }, role);
      
      if (response.token && response.user) {
        updateAuthState(response.user, response.token);
        
        switch (role) {
          case 'volunteer':
            router.push('/volunteer');
            break;
          case 'citizen':
          default:
            router.push('/citizen');
        }
        
        return response;
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuth();
    }
  };
  

  const refreshUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      if (userData) {
        updateAuthState(userData, Cookies.get('auth_token') || '');
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  useEffect(() => {
    const handleTabClose = () => {
      Cookies.remove('auth_token', { path: '/' });
    };

    window.addEventListener('beforeunload', handleTabClose);
    
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  const value: AuthContextType = {
    isAuthenticated: !!user,
    user,
    userRole,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};