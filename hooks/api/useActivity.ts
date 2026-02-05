'use client';

import { activityAPI, usersAPI } from '@/lib/services/api/endpoints';
import { useApi } from './useApi';
import type { UserActivity } from '@/types/user.types';

export const useRecentActivity = () => {
  return useApi<UserActivity[]>(
    async () => (await activityAPI.getRecentActivity()).data,
    { immediate: true }
  );
};

export const useUserActivity = (userId: string) => {
  return useApi<UserActivity[]>(
    async () => (await usersAPI.getUserActivity(userId)).data,
    { immediate: true }
  );
};

export const useCreateActivity = () => {
  return useApi<UserActivity[]>(
    async () => (await activityAPI.createActivity()).data,
    { immediate: true }
  );
};

export const useActivityStats = () => {
  return useApi<UserActivity[]>(
    async () => (await activityAPI.getActivityStats()).data,
    { immediate: true }
  );
};