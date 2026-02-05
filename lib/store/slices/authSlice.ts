// lib/store/slices/authSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/auth.types'; // Use User from auth.types

interface AuthState {
  isAuthenticated: boolean;
  user: User | null; // Changed from UserProfile to User
  role: 'citizen' | 'volunteer' | 'admin' | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  lastLogin: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  role: null,
  token: null,
  isLoading: false,
  error: null,
  lastLogin: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ 
      user: User; // Changed from UserProfile to User
      token: string; 
      role?: 'citizen' | 'volunteer' | 'admin' | null;
      lastLogin?: string;
    }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.role || action.payload.user.role;
      state.lastLogin = action.payload.lastLogin || new Date().toISOString();
      state.error = null;
      state.isLoading = false;
    },
    clearUser: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.token = null;
      state.lastLogin = null;
      state.error = null;
      state.isLoading = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => { // Changed from UserProfile to User
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setRole: (state, action: PayloadAction<'citizen' | 'volunteer' | 'admin' | null>) => {
      state.role = action.payload;
      if (state.user) {
        state.user.role = action.payload as any;
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    updateLastLogin: (state) => {
      state.lastLogin = new Date().toISOString();
    },
  },
});

export const { 
  setUser, 
  clearUser, 
  updateUser, 
  setLoading, 
  setError,
  setRole,
  setToken,
  updateLastLogin 
} = authSlice.actions;

export default authSlice.reducer;