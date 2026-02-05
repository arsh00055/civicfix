'use client';

import { useState, useCallback, useMemo } from 'react';
import { IssueFilters } from '@/types/issue.types';

export type SortOption = 'newest' | 'oldest' | 'priority' | 'votes' | 'updated';

interface UseIssueFiltersReturn {
  filters: IssueFilters;
  sortBy: SortOption;
  setFilters: (newFilters: Partial<IssueFilters>) => void;
  updateFilter: (key: keyof IssueFilters, value: string) => void;
  setSortBy: (option: SortOption) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  getFilterCount: () => number;
}

export const useIssueFilters = (initialFilters?: Partial<IssueFilters>): UseIssueFiltersReturn => {
  const [filters, setFilters] = useState<IssueFilters>({
    status: initialFilters?.status || '',
    category: initialFilters?.category || '',
    priority: initialFilters?.priority || '',
    location: initialFilters?.location || '',
    search: initialFilters?.search || '',
    dateRange: initialFilters?.dateRange || { start: '', end: '' },
    assignedTo: initialFilters?.assignedTo || '',
    reporterId: initialFilters?.reporterId || '',
  });

  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const updateFilter = useCallback((key: keyof IssueFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<IssueFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      status: '',
      category: '',
      priority: '',
      location: '',
      search: '',
      dateRange: { start: '', end: '' },
      assignedTo: '',
      reporterId: '',
    });
  }, []);

  const getFilterCount = useCallback(() => {
    let count = 0;
    
    // Count basic filters
    if (filters.status) count++;
    if (filters.category) count++;
    if (filters.priority) count++;
    if (filters.location) count++;
    if (filters.search) count++;
    if (filters.assignedTo) count++;
    if (filters.reporterId) count++;
    
    // Count date range filter only if both dates are set
    if (filters.dateRange?.start && filters.dateRange?.end) {
      count++;
    }
    
    return count;
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return getFilterCount() > 0;
  }, [getFilterCount]);

  return {
    filters,
    sortBy,
    setFilters: updateFilters,
    updateFilter,
    setSortBy,
    clearFilters,
    hasActiveFilters,
    getFilterCount,
  };
};