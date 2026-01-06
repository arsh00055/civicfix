'use client';

import { useApi } from './useApi';
import { usersService } from '@/lib/services/api/usersService';
import type { User } from '@/types/user.types';

export const useUsers = () => {
  return useApi<User[]>(
    () => usersService.getUsers(), 
    { 
      immediate: true,
      cacheKey: 'users-all',
      cacheDuration: 5 * 60 * 1000,
    }
  );
};

export const useUser = (id: string) => {
  return useApi<User>(
    () => usersService.getUserById(id), 
    { 
      immediate: !!id,
      cacheKey: `user-${id}`,
    }
  );
};

export const useUserProfile = () => {
  return useApi<User>(
    () => usersService.getCurrentUser(), 
    { 
      immediate: true,
      cacheKey: 'current-user',
    }
  );
};

export const useUpdateProfile = () => {
  return useApi<User>(usersService.updateProfile);
};

export const useUpdateUserRole = () => {
  return useApi<User>(usersService.updateUserRole);
};

export const useUserStats = () => {
  return useApi(
    () => usersService.getUserStats(), 
    { 
      immediate: true,
      cacheKey: 'user-stats',
      cacheDuration: 3 * 60 * 1000,
    }
  );
};