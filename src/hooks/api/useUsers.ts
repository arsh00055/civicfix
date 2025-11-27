import { useApi } from '../useApi';
import { usersAPI } from '../../services/api/endpoints';

export const useUsers = () => {
  return useApi(() => usersAPI.getUsers(), { immediate: true });
};

export const useUser = (id: string) => {
  return useApi(() => usersAPI.getUser(id));
};

export const useUserProfile = () => {
  return useApi(() => usersAPI.getProfile(), { immediate: true });
};

export const useUpdateProfile = () => {
  return useApi(usersAPI.updateProfile);
};