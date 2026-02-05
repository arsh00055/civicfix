'use client';

import { useApi } from './useApi';
import { usersAPI } from '@/lib/services/api/endpoints';
import type { UserProfile, UserActivity } from '@/types/user.types';

export const useUsers = (params?: any) => {
  return useApi<UserProfile[]>(
    () => usersAPI.getUsers(params).then(res => res.data), 
    { 
      immediate: true,
      cacheKey: `users-${JSON.stringify(params || {})}`,
      cacheDuration: 5 * 60 * 1000,
    }
  );
};

export const useUser = (id: string) => {
  return useApi<UserProfile>(
    () => usersAPI.getUser(id).then(res => res.data), 
    { 
      immediate: !!id,
      cacheKey: `user-${id}`,
    }
  );
};

export const useUserProfile = () => {
  return useApi<UserProfile>(
    () => usersAPI.getProfile().then(res => res.data), 
    { 
      immediate: true,
      cacheKey: 'current-user',
    }
  );
};

export const useUpdateProfile = () => {
  const mutation = useApi<UserProfile>(
    async (profileData: any) => {
      const response = await usersAPI.updateProfile(profileData);
      return response.data;
    },
    { immediate: false }
  );

  return {
    updateProfile: mutation.execute,
    loading: mutation.loading,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};

export const useUpdateUserRole = () => {
  const mutation = useApi<UserProfile>(
    async ({ userId, role }: { userId: string; role: string }) => {
      const response = await usersAPI.updateUserRole(userId, role);
      return response.data;
    },
    { immediate: false }
  );

  return {
    updateUserRole: mutation.execute,
    loading: mutation.loading,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};

export const useSearchUsers = () => {
  const mutation = useApi<UserProfile[]>(
    async (query: string) => {
      const response = await usersAPI.searchUsers(query);
      return response.data;
    },
    { immediate: false }
  );

  return {
    searchUsers: mutation.execute,
    loading: mutation.loading,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};

export const useUserActivity = (userId: string) => {
  return useApi<UserActivity[]>(
    () => usersAPI.getUserActivity(userId).then(res => res.data), 
    { 
      immediate: !!userId,
      cacheKey: `user-activity-${userId}`,
    }
  );
};