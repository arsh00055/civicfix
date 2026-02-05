'use client';

import { useApi } from './useApi';
import { issuesAPI } from '@/lib/services/api/endpoints';
import type { Issue, IssueFilters } from '@/types/issue.types';

export const useIssues = (filters?: IssueFilters) => {
  return useApi<Issue[]>(
    async () => {
      const response = await issuesAPI.getIssues(filters);
      return response.data;
    },
    { 
      immediate: true,
      cacheKey: filters ? `issues-${JSON.stringify(filters)}` : 'issues-all',
      cacheDuration: 2 * 60 * 1000, // 2 minutes for issue lists
    }
  );
};

export const useIssue = (id: string) => {
  return useApi<Issue>(
    async () => {
      const response = await issuesAPI.getIssue(id);
      return response.data;
    }, 
    { 
      immediate: !!id,
      cacheKey: `issue-${id}`,
      cacheDuration: 5 * 60 * 1000, // 5 minutes for single issue
    }
  );
};

export const useCreateIssue = (id: string) => {
  return useApi<Issue>(
    async () => {
      const response = await issuesAPI.createIssue(id)
    return response.data;
  });
};

export const useUpdateIssue = (id: string, data: any) => {
  return useApi<Issue>(
    async () => {
      const response = await issuesAPI.updateIssue(id, data)
    return response.data;
  });
};

export const useDeleteIssue = (id: string) => {
  return useApi<Issue>(
    async () => {
      const response = await issuesAPI.deleteIssue(id)
    return response.data;
  });
};

export const useMyReports = () => {
  return useApi<Issue[]>(
    async () => {
      const response = await issuesAPI.getMyReports()
    return response.data;
  }, 
    { 
      immediate: true,
      cacheKey: 'my-reports',
      cacheDuration: 2 * 60 * 1000,
    }
  );
};

export const useVoteIssue = (id: string) => {
  return useApi<Issue>(
    async () => {
      const response = await issuesAPI.voteIssue(id)
    return response.data;
  });
};

export const useClaimIssue = (id: string) => {
  return useApi<Issue>(
    async () => {
      const response = await issuesAPI.claimIssue(id)
    return response.data;
  });
};