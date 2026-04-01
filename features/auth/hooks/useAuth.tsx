// 'use client';

// import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import Cookies from 'js-cookie';
// import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
// import { setUser, clearUser, setLoading, setToken } from '@/lib/store/slices/authSlice';
// import { authApi } from '@/lib/services/api/endpoints';
// import { User } from '@/types/auth.types';

// interface AuthContextType {
//   isAuthenticated: boolean;
//   user: User | null;
//   userRole: string | null;
//   isLoading: boolean;
//   login: (email: string, password: string, role: string, additionalData?: any) => Promise<any>;
//   register: (data: any, role: string) => Promise<void>;
//   logout: () => Promise<void>;
//   refreshUser: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const COOKIE_CONFIG = {
//   expires: 1,
//   path: '/',
//   secure: process.env.NODE_ENV === 'production',
//   sameSite: 'strict' as const,
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { user: storeUser, token: storeToken, isLoading: storeLoading } = useAppSelector((state) => state.auth);
  
//   const [isLoading, setIsLoading] = useState(true);
//   const [user, setUserState] = useState<User | null>(null);
//   const [userRole, setUserRole] = useState<'citizen' | 'volunteer' | 'admin' | null>(null);

//   // Initialize auth from multiple storage sources
//   const initializeAuth = useCallback(() => {
//     try {
//       const cookieToken = Cookies.get('auth_token');
//       const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
//       const token = cookieToken || localStorageToken;
      
//       const cookieUserData = Cookies.get('user_data');
//       const localStorageUserData = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
//       const userDataStr = cookieUserData || localStorageUserData;
      
//       const cookieRole = Cookies.get('user_role');
//       const localStorageRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
//       const role = cookieRole || localStorageRole;

//       if (token && userDataStr) {
//         try {
//           const parsedUser = JSON.parse(userDataStr);
          
//           // Sync all storage methods
//           if (!cookieToken) Cookies.set('auth_token', token, COOKIE_CONFIG);
//           if (!localStorageToken && typeof window !== 'undefined') localStorage.setItem('auth_token', token);
          
//           if (!cookieUserData) Cookies.set('user_data', userDataStr, COOKIE_CONFIG);
//           if (!localStorageUserData && typeof window !== 'undefined') localStorage.setItem('user_data', userDataStr);
          
//           if (role && !cookieRole) Cookies.set('user_role', role, COOKIE_CONFIG);
//           if (role && !localStorageRole && typeof window !== 'undefined') localStorage.setItem('user_role', role);
          
//           setUserState(parsedUser);
//           setUserRole(parsedUser.role || role);
          
//           // Dispatch to Redux if not already set
//           if (!storeUser || storeUser.id !== parsedUser.id) {
//             dispatch(setUser({ 
//               user: parsedUser,
//               token,
//               role: parsedUser.role
//             }));
//           }
//         } catch (error) {
//           console.error('Failed to parse user data:', error);
//           clearAuthStorage();
//         }
//       } else if (storeUser && storeToken) {
//         // If we have Redux state but no storage, sync it
//         setUserState(storeUser as unknown as User);
//         setUserRole(storeUser.role);
        
//         const userDataStr = JSON.stringify(storeUser);
//         Cookies.set('auth_token', storeToken, COOKIE_CONFIG);
//         Cookies.set('user_data', userDataStr, COOKIE_CONFIG);
//         Cookies.set('user_role', storeUser.role, COOKIE_CONFIG);
        
//         if (typeof window !== 'undefined') {
//           localStorage.setItem('auth_token', storeToken);
//           localStorage.setItem('user_data', userDataStr);
//           localStorage.setItem('user_role', storeUser.role);
//         }
//       }
//     } catch (error) {
//       console.error('Auth initialization error:', error);
//       clearAuthStorage();
//     } finally {
//       setIsLoading(false);
//       dispatch(setLoading(false));
//     }
//   }, [dispatch, storeUser, storeToken]);

//   useEffect(() => {
//     initializeAuth();
//   }, [initializeAuth]);

//   const updateAuthState = useCallback((userData: User, authToken: string) => {
//     setUserState(userData);
//     setUserRole(userData.role);
    
//     // Save to all storage methods
//     const userDataStr = JSON.stringify(userData);
    
//     // Cookies
//     Cookies.set('auth_token', authToken, COOKIE_CONFIG);
//     Cookies.set('user_role', userData.role, COOKIE_CONFIG);
//     Cookies.set('user_data', userDataStr, COOKIE_CONFIG);
    
//     // LocalStorage
//     if (typeof window !== 'undefined') {
//       localStorage.setItem('auth_token', authToken);
//       localStorage.setItem('user_role', userData.role);
//       localStorage.setItem('user_data', userDataStr);
//     }
    
//     // Dispatch to Redux
//     dispatch(setUser({ 
//       user: userData,
//       token: authToken,
//       role: userData.role
//     }));
//   }, [dispatch]);

//   const clearAuthStorage = useCallback(() => {
//     // Clear cookies
//     Cookies.remove('auth_token');
//     Cookies.remove('user_role');
//     Cookies.remove('user_data');
    
//     // Clear localStorage
//     if (typeof window !== 'undefined') {
//       localStorage.removeItem('auth_token');
//       localStorage.removeItem('user_role');
//       localStorage.removeItem('user_data');
//     }
    
//     // Clear state
//     setUserState(null);
//     setUserRole(null);
//   }, []);

//   const clearAuth = useCallback(() => {
//     clearAuthStorage();
//     dispatch(clearUser());
//     router.push('/login');
//   }, [dispatch, router, clearAuthStorage]);

//   const login = async (email: string, password: string, role: string, additionalData?: any) => {
//     try {
//       const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  
//       const response = await fetch(`${baseUrl}/api/auth/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email,
//           password,
//           role,
//           securityKey: additionalData?.securityKey
//         }),
//       });
  
//       const data = await response.json();
//       console.log("🔎 Login API response:", data);
  
//       // Fail hoya — seedha return karo, koi state change nahi
//       if (!data.success) {
//         return data;
//       }
  
//       // Success — state update karo
//       updateAuthState(data.data.user, data.data.token);
  
//       setTimeout(() => {
//         switch (role) {
//           case "admin":
//             router.push("/admin");
//             break;
//           case "volunteer":
//             router.push("/volunteer");
//             break;
//           case "citizen":
//           default:
//             router.push("/citizen");
//             break;
//         }
//       }, 100);
  
//       return data;
  
//     } catch (error: any) {
//       console.error("❌ Login error:", error);
//       return { 
//         success: false, 
//         message: error?.message || "Network error. Please try again." 
//       };
//     }
//   };

//   const mockLoginFallback = async (email: string, password: string, role: string) => {
//     const mockToken = `mock-token-${Date.now()}`;
//     const mockUser: User = {
//       id: `user-${Date.now()}`,
//       email,
//       name: email.split('@')[0],
//       role: role as any,
//       avatar: null,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       phone: '+1234567890',
//       isActive: true,
//       isVerified: true
//     };

//     updateAuthState(mockUser, mockToken);
    
//     setTimeout(() => {
//       switch (role) {
//         case 'admin':
//           router.push('/admin');
//           break;
//         case 'volunteer':
//           router.push('/volunteer');
//           break;
//         case 'citizen':
//         default:
//           router.push('/citizen');
//       }
//     }, 100);
//   };

//   const register = async (data: any, role: string) => {
//     setIsLoading(true);
//     dispatch(setLoading(true));
    
//     try {
//       const response = await authApi.register({ ...data, role }, role);
      
//       if (response.token && response.user) {
//         updateAuthState(response.user, response.token);
//         setTimeout(() => {
//           switch (role) {
//             case 'volunteer':
//               router.push('/volunteer');
//               break;
//             case 'citizen':
//             default:
//               router.push('/citizen');
//           }
//         }, 100);
//       }
//     } catch (error: any) {
//       console.error('Registration failed:', error);
//       throw new Error(error?.message || 'Registration failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//       dispatch(setLoading(false));
//     }
//   };

//   const logout = async () => {
//     try {
//       await authApi.logout();
//     } catch (error) {
//       console.error('Logout API call failed:', error);
//     } finally {
//       clearAuth();
//     }
//   };

//   const refreshUser = async (): Promise<void> => {
//     try {
//       const response = await authApi.getCurrentUser();
      
//       if (response.success) {
//         const userData = response.user;
        
//         // Format user with id
//         const formattedUser = {
//           id: userData.id || userData._id,
//           _id: userData.id || userData._id,
//           firstName: userData.firstName || '',
//           lastName: userData.lastName || '',
//           name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
//           email: userData.email,
//           role: userData.role,
//           avatar: userData.avatar,
//           phone: userData.phone,
//           isActive: userData.isActive,
//           isEmailVerified: userData.isEmailVerified,
//           createdAt: userData.createdAt,
//           updatedAt: userData.updatedAt,
//           isVerified: userData.isEmailVerified,
//           skills: userData.skills,
//           availability: userData.availability,
//           experienceLevel: userData.experienceLevel,
//           approvalStatus: userData.approvalStatus,
//           department: userData.department,
//           permissions: userData.permissions
//         };
        
//         // Get token from storage
//         const token = Cookies.get('auth_token') || localStorage.getItem('auth_token');
        
//         // Update Redux store
//         dispatch(setUser({ 
//           user: formattedUser,
//           token: token || '',
//           role: formattedUser.role
//         }));
        
//         // Update localStorage
//         localStorage.setItem('user_data', JSON.stringify(formattedUser));
        
//         // Update state
//         setUserState(formattedUser);
        
//         console.log('✅ User refreshed:', formattedUser);
//       } else {
//         throw new Error('Failed to refresh user');
//       }
//     } catch (error) {
//       console.error('Failed to refresh user data:', error);
//       throw error;
//     }
//   };

//   // Check auth status on route changes
//   useEffect(() => {
//     const handleRouteChange = () => {
//       const token = Cookies.get('auth_token');
//       if (!token && user) {
//         console.log('Token lost during navigation, clearing auth');
//         clearAuth();
//       }
//     };

//     return () => {};
//   }, [router, user, clearAuth]);

//   // Sync state with Redux
//   useEffect(() => {
//     if (storeUser && !user) {
//       setUserState(storeUser as unknown as User);
//       setUserRole(storeUser.role);
//     }
//   }, [storeUser, user]);

//   const value: AuthContextType = {
//     isAuthenticated: !!user || !!(Cookies.get('auth_token')),
//     user,
//     userRole,
//     isLoading: isLoading || storeLoading,
//     login,
//     register,
//     logout,
//     refreshUser,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };


'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setUser, clearUser, setLoading, setToken } from '@/lib/store/slices/authSlice';
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
  const { user: storeUser, token: storeToken, isLoading: storeLoading } = useAppSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUserState] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'citizen' | 'volunteer' | 'admin' | null>(null);

  // ✅ Single source of truth — update everywhere at once
  const updateAuthState = useCallback((userData: User, authToken: string) => {
    const userDataStr = JSON.stringify(userData);

    // Update local state
    setUserState(userData);
    setUserRole(userData.role);

    // Update cookies
    Cookies.set('auth_token', authToken, COOKIE_CONFIG);
    Cookies.set('user_role', userData.role, COOKIE_CONFIG);
    Cookies.set('user_data', userDataStr, COOKIE_CONFIG);

    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user_role', userData.role);
      localStorage.setItem('user_data', userDataStr);
    }

    // Update Redux
    dispatch(setUser({
      user: userData,
      token: authToken,
      role: userData.role,
    }));
  }, [dispatch]);

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

  // ✅ Initialize auth — reads from storage once on mount
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
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuthStorage();
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  }, [dispatch, storeUser, storeToken, updateAuthState, clearAuthStorage]);

  useEffect(() => {
    initializeAuth();
  }, []); // ✅ Only on mount — stale deps hataye

  const login = async (email: string, password: string, role: string, additionalData?: any) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role,
          securityKey: additionalData?.securityKey,
        }),
      });

      const data = await response.json();
      console.log('🔎 Login API response:', data);

      if (!data.success) return data;

      updateAuthState(data.data.user, data.data.token);

      setTimeout(() => {
        switch (role) {
          case 'admin': router.push('/admin'); break;
          case 'volunteer': router.push('/volunteer'); break;
          default: router.push('/citizen');
        }
      }, 100);

      return data;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      return { success: false, message: error?.message || 'Network error. Please try again.' };
    }
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
            case 'volunteer': router.push('/volunteer'); break;
            default: router.push('/citizen');
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

  // ✅ FIXED refreshUser — updates ALL storage sources properly
  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authApi.getCurrentUser();

      if (response.success) {
        const userData = response.user;

        const formattedUser: User = {
          id: userData.id || userData._id,
          _id: userData.id || userData._id,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          name:
            userData.name ||
            `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          email: userData.email,
          role: userData.role,
          avatar: userData.avatar,
          phone: userData.phone,
          isActive: userData.isActive,
          isEmailVerified: userData.isEmailVerified,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          isVerified: userData.isEmailVerified,
          skills: userData.skills,
          availability: userData.availability,
          experienceLevel: userData.experienceLevel,
          approvalStatus: userData.approvalStatus,
          department: userData.department,
          permissions: userData.permissions,
          bio: userData.bio,
          city: userData.city,
          address: userData.address,
          state: userData.state,
          zipCode: userData.zipCode,
        } as User;

        // ✅ Get existing token — don't lose it
        const existingToken =
          Cookies.get('auth_token') ||
          (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '') ||
          '';

        // ✅ updateAuthState — updates Redux + cookies + localStorage + local state
        updateAuthState(formattedUser, existingToken);

        console.log('✅ User refreshed successfully:', formattedUser);
      } else {
        throw new Error('Failed to refresh user — API returned success: false');
      }
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
      throw error;
    }
  };

  // Sync Redux → local state (agar Redux bahar se update ho)
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