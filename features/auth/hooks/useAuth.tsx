'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setUser, clearUser, setLoading } from '@/lib/store/slices/authSlice';
import { authApi } from '@/lib/services/api/endpoints';
import { User } from '@/types/auth.types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userRole: 'citizen' | 'volunteer' | 'admin' | null;
  isLoading: boolean;
  login: (email: string, password: string, role: string, additionalData?: any) => Promise<any>;
  register: (data: any, role: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_CONFIG = {
  expires: 7, // Changed from 1 to 7 days
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: storeUser, token: storeToken, isLoading: storeLoading } = useAppSelector((state) => state.auth);
  
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUserState] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'citizen' | 'volunteer' | 'admin' | null>(null);

  // Initialize auth from multiple storage sources
  const initializeAuth = useCallback(() => {
    try {
      const cookieToken = Cookies.get('auth_token');
      const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const token = cookieToken || localStorageToken;
      
      const cookieUserData = Cookies.get('user_data');
      const localStorageUserData = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
      const userDataStr = cookieUserData || localStorageUserData;
      
      const cookieRole = Cookies.get('user_role');
      const localStorageRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
      const role = cookieRole || localStorageRole;

      if (token && userDataStr) {
        try {
          const parsedUser = JSON.parse(userDataStr);
          
          // Sync all storage methods
          if (!cookieToken) Cookies.set('auth_token', token, COOKIE_CONFIG);
          if (!localStorageToken && typeof window !== 'undefined') localStorage.setItem('auth_token', token);
          
          if (!cookieUserData) Cookies.set('user_data', userDataStr, COOKIE_CONFIG);
          if (!localStorageUserData && typeof window !== 'undefined') localStorage.setItem('user_data', userDataStr);
          
          if (role && !cookieRole) Cookies.set('user_role', role, COOKIE_CONFIG);
          if (role && !localStorageRole && typeof window !== 'undefined') localStorage.setItem('user_role', role);
          
          setUserState(parsedUser);
          setUserRole(parsedUser.role || role);
          
          // Dispatch to Redux if not already set
          if (!storeUser || storeUser.id !== parsedUser.id) {
            dispatch(setUser({ 
              user: parsedUser,
              token,
              role: parsedUser.role
            }));
          }
        } catch (error) {
          console.error('Failed to parse user data:', error);
          clearAuthStorage();
        }
      } else if (storeUser && storeToken) {
        // If we have Redux state but no storage, sync it
        setUserState(storeUser as unknown as User);
        setUserRole(storeUser.role);
        
        const userDataStr = JSON.stringify(storeUser);
        Cookies.set('auth_token', storeToken, COOKIE_CONFIG);
        Cookies.set('user_data', userDataStr, COOKIE_CONFIG);
        Cookies.set('user_role', storeUser.role, COOKIE_CONFIG);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', storeToken);
          localStorage.setItem('user_data', userDataStr);
          localStorage.setItem('user_role', storeUser.role);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuthStorage();
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  }, [dispatch, storeUser, storeToken]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const updateAuthState = useCallback((userData: User, authToken: string) => {
    setUserState(userData);
    setUserRole(userData.role);
    
    // Save to all storage methods
    const userDataStr = JSON.stringify(userData);
    
    // Cookies
    Cookies.set('auth_token', authToken, COOKIE_CONFIG);
    Cookies.set('user_role', userData.role, COOKIE_CONFIG);
    Cookies.set('user_data', userDataStr, COOKIE_CONFIG);
    
    // LocalStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user_role', userData.role);
      localStorage.setItem('user_data', userDataStr);
    }
    
    // Dispatch to Redux
    dispatch(setUser({ 
      user: userData,
      token: authToken,
      role: userData.role
    }));
  }, [dispatch]);

  const clearAuthStorage = useCallback(() => {
    // Clear cookies
    Cookies.remove('auth_token');
    Cookies.remove('user_role');
    Cookies.remove('user_data');
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_data');
    }
    
    // Clear state
    setUserState(null);
    setUserRole(null);
  }, []);

  const clearAuth = useCallback(() => {
    clearAuthStorage();
    dispatch(clearUser());
    router.push('/login');
  }, [dispatch, router, clearAuthStorage]);

  const login = async (email: string, password: string, role: string, additionalData?: any) => {
    setIsLoading(true);
    dispatch(setLoading(true));
  
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
          securityKey: additionalData?.securityKey // 👈 YEH ADD KARO
        }),
      });
  
      const data = await response.json();
      console.log("🔎 Login API response:", data);
  
      if (!data.success) {
        return data;
      }
  
      updateAuthState(data.data.user, data.data.token);
  
      setTimeout(() => {
        switch (role) {
          case "admin":
            router.push("/admin");
            break;
          case "volunteer":
            router.push("/volunteer");
            break;
          case "citizen":
          default:
            router.push("/citizen");
            break;
        }
      }, 100);
  
      return data;
  
    } catch (error: any) {
      console.error("❌ Login error:", error);
      return { 
        success: false, 
        message: error?.message || "Network error. Please try again." 
      };
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
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
      isActive: true,
      isVerified: true
    };

    updateAuthState(mockUser, mockToken);
    
    setTimeout(() => {
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
      }
    }, 100);
  };

  const register = async (data: any, role: string) => {
    setIsLoading(true);
    dispatch(setLoading(true));
    
    try {
      const response = await authApi.register({ ...data, role }, role);
      
      if (response.token && response.user) {
        updateAuthState(response.user, response.token);
        setTimeout(() => {
          switch (role) {
            case 'volunteer':
              router.push('/volunteer');
              break;
            case 'citizen':
            default:
              router.push('/citizen');
          }
        }, 100);
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
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
      const token = Cookies.get('auth_token') || localStorage.getItem('auth_token');
      
      if (userData && token) {
        updateAuthState(userData, token);
      } else {
        throw new Error('No token available');
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  // Check auth status on route changes
  useEffect(() => {
    const handleRouteChange = () => {
      const token = Cookies.get('auth_token');
      if (!token && user) {
        console.log('Token lost during navigation, clearing auth');
        clearAuth();
      }
    };

    // Next.js App Router does not expose router.events; use built-in navigation events (if required) or remove these lines.
    // If you require route change detection, consider using a custom event handler or external router event library.

    // No-op cleanup to maintain consistent hook signature.
    // See: https://github.com/vercel/next.js/discussions/41745
    return () => {};
  }, [router, user, clearAuth]);

  // Sync state with Redux
  useEffect(() => {
    if (storeUser && !user) {
      setUserState(storeUser as unknown as User);
      setUserRole(storeUser.role);
    }
  }, [storeUser, user]);

  const value: AuthContextType = {
    isAuthenticated: !!user || !!(Cookies.get('auth_token')),
    user,
    userRole,
    isLoading: isLoading || storeLoading,
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