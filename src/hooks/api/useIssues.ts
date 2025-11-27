import { useApi } from '../useApi';
import { issuesAPI } from '../../services/api/endpoints';

export const useIssues = () => {
  return useApi(() => issuesAPI.getIssues(), { immediate: true });
};

export const useIssue = (id: string) => {
  return useApi(() => issuesAPI.getIssue(id), { immediate: true });
};

export const useCreateIssue = () => {
  return useApi(issuesAPI.createIssue);
};

export const useUpdateIssue = () => {
  return useApi(issuesAPI.updateIssue);
};

export const useMyReports = () => {
  return useApi(() => issuesAPI.getMyReports(), { immediate: true });
};