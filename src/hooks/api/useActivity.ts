import { useApi } from '../useApi';
import { activityAPI } from '../../services/api/endpoints';

export const useRecentActivity = () => {
  return useApi(() => activityAPI.getRecentActivity(), { immediate: true });
};