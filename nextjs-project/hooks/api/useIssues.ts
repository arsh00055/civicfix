'use client';

import { useApi } from './useApi';
import { issuesAPI } from '@/lib/services/api/endpoints';
import type { Issue, IssueFilters } from '@/types/issue.types';

export const useIssues = (filters?: IssueFilters) => {
  return useApi<Issue[]>(
    () => issuesAPI.getIssues(filters), 
    { 
      immediate: true,
      cacheKey: filters ? `issues-${JSON.stringify(filters)}` : 'issues-all',
      cacheDuration: 2 * 60 * 1000, // 2 minutes for issue lists
    }
  );
};

export const useIssue = (id: string) => {
  return useApi<Issue>(
    () => issuesAPI.getIssueById(id), 
    { 
      immediate: !!id,
      cacheKey: `issue-${id}`,
      cacheDuration: 5 * 60 * 1000, // 5 minutes for single issue
    }
  );
};

export const useCreateIssue = () => {
  return useApi<Issue>(issuesAPI.createIssue);
};

export const useUpdateIssue = () => {
  return useApi<Issue>(issuesAPI.updateIssue);
};

export const useDeleteIssue = () => {
  return useApi<void>(issuesAPI.deleteIssue);
};

export const useMyReports = () => {
  return useApi<Issue[]>(
    () => issuesAPI.getMyReports(), 
    { 
      immediate: true,
      cacheKey: 'my-reports',
      cacheDuration: 2 * 60 * 1000,
    }
  );
};

export const useVoteIssue = () => {
  return useApi<Issue>(issuesAPI.voteIssue);
};

export const useClaimIssue = () => {
  return useApi<Issue>(issuesAPI.claimIssue);
};