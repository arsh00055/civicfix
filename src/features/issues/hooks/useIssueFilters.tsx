import { useState, useCallback } from 'react';
import type { IssueFilters } from '../../../types';

export type SortOption = 'newest' | 'oldest' | 'priority' | 'votes' | 'updated';

export const useIssueFilters = () => {
  const [filters, setFilters] = useState<IssueFilters>({
    status: '',
    category: '',
    priority: '',
    location: '',
    search: '',
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
    });
  }, []);

  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== '' && 
      !(typeof value === 'object' && Object.keys(value).length === 0)
    );
  }, [filters]);

  return {
    filters,
    sortBy,
    setFilters: updateFilters,
    updateFilter,
    setSortBy,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
  };
};