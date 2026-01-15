'use client';

import { useState, useCallback } from 'react';
import { volunteersAPI } from '@/lib/services/api/endpoints';
import type { VolunteerTask, VolunteerFilters } from '@/types/volunteer.types';

interface UseVolunteersReturn {
  claimTask: (taskId: string) => Promise<any>;
  updateTaskStatus: (taskId: string, status: string) => Promise<any>;
  getAvailableTasks: () => Promise<VolunteerTask[]>;
  getMyAssignments: () => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

export function useVolunteers(): UseVolunteersReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimTask = useCallback(async (taskId: string): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await volunteersAPI.claimTask(taskId);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to claim task');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, status: string): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await volunteersAPI.updateTaskStatus(taskId, status);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to update task status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAvailableTasks = useCallback(async (): Promise<VolunteerTask[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await volunteersAPI.getAvailableTasks();
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch available tasks');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMyAssignments = useCallback(async (): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await volunteersAPI.getMyAssignments();
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch assignments');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    claimTask,
    updateTaskStatus,
    getAvailableTasks,
    getMyAssignments,
    isLoading,
    error
  };
}

// Optional: Create a simpler hook for fetching volunteers (if needed elsewhere)
export function useVolunteersList(filters?: VolunteerFilters) {
  const [volunteers, setVolunteers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVolunteers = useCallback(async () => {
    // This would be a separate API endpoint if you need to list volunteers
    // For now, it's a placeholder since your IssueCard doesn't use it
    return [];
  }, [filters]);

  return { volunteers, isLoading, error, fetchVolunteers };
}