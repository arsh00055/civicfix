import { useApi } from '../useApi';
import { authApi } from '../../services/api/endpoints';

export const useLogin = () => {
  return useApi(authApi.login);
};

export const useRegisterCitizen = () => {
  return useApi(authApi.registerCitizen);
};

export const useRegisterVolunteer = () => {
  return useApi(authApi.registerVolunteer);
};

export const useRegisterAdmin = () => {
  return useApi(authApi.registerAdmin);
};

export const useCurrentUser = () => {
  return useApi(authApi.getCurrentUser, { immediate: true });
};