'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Issue } from '@/types/issue.types';
import IssueCard from '@/components/UI/cards/IssueCard';
import IssueFilters from './IssueFilters';
import IssueSort from './IssueSort';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import { MapIcon } from '@/components/UI/icons';
import { useIssues } from '@/features/issues/hooks/useIssue';
import { SortOption, useIssueFilters } from '@/features/issues/hooks/useIssueFilters';
import { SkeletonLoader } from '@/app/loading';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IssueListProps {
  issues?: Issue[];
  showFilters?: boolean;
  showSort?: boolean;
  showPagination?: boolean;
  showActions?: boolean;
  showVoting?: boolean;
  limit?: number;
  title?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onIssueClick?: (issue: Issue) => void;
  onVote?: (issueId: string) => Promise<void>;
  getUserVoteStatus?: (issueId: string) => boolean;
}

// ---------------------------------------------------------------------------
// Module-level constants
// ---------------------------------------------------------------------------

// UX: quick-filter chips let users filter with one tap instead of opening a
// dropdown. Defined at module level — not rebuilt on every render.
const QUICK_FILTERS = Object.freeze([
  { label: 'All',         status: '',            priority: '' },
  { label: 'Reported',    status: 'reported',    priority: '' },
  { label: 'In Progress', status: 'in_progress', priority: '' },
  { label: 'Resolved',    status: 'resolved',    priority: '' },
  { label: 'High priority', status: '',          priority: 'high' },
  { label: 'Critical',    status: '',            priority: 'critical' },
]);

// Priority sort order — defined once
const PRIORITY_ORDER: Record<string, number> = Object.freeze({
  critical: 4, high: 3, medium: 2, low: 1,
});

const PAGE_SIZE_DEFAULT = 10;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const IssueList: React.FC<IssueListProps> = ({
  issues: externalIssues,
  showFilters       = true,
  showSort          = true,
  showPagination    = true,
  showActions       = true,
  showVoting        = true,
  limit,
  title             = 'Community Issues',
  emptyStateTitle   = 'No issues found',
  emptyStateDescription,
  onIssueClick,
  onVote,
  getUserVoteStatus,
}) => {
  const router = useRouter();

  const internalIssues = useIssues();
  const issues  = externalIssues ?? internalIssues.issues ?? [];
  const loading = externalIssues ? false : internalIssues.loading;
  const error   = externalIssues ? null  : internalIssues.error;

  const { filters, setFilters, sortBy, setSortBy, clearFilters, hasActiveFilters } = useIssueFilters();
  const [currentPage, setCurrentPage] = useState(1);

  // UX: active quick-filter index for the chip bar highlight
  const [activeChip, setActiveChip] = useState(0);

  // ---------------------------------------------------------------------------
  // Filtering + sorting — single useMemo, one pass through the array
  // ---------------------------------------------------------------------------

  const filteredAndSortedIssues = useMemo<Issue[]>(() => {
    let result = issues;

    // Apply filters (avoid spreading unless we actually need to mutate)
    const needsFilter =
      (filters.status   && filters.status   !== 'all') ||
      (filters.category && filters.category !== 'all') ||
      (filters.priority && filters.priority !== 'all') ||
      filters.search;

    if (needsFilter) {
      const searchLower = filters.search?.toLowerCase() ?? '';
      result = issues.filter(i => {
        if (filters.status   && filters.status   !== 'all' && i.status   !== filters.status)   return false;
        if (filters.category && filters.category !== 'all' && i.category !== filters.category) return false;
        if (filters.priority && filters.priority !== 'all' && i.priority !== filters.priority) return false;
        if (searchLower && !(
          i.title.toLowerCase().includes(searchLower)       ||
          i.description?.toLowerCase().includes(searchLower) ||
          i.location?.toLowerCase().includes(searchLower)
        )) return false;
        return true;
      });
    }

    // Sort — create a shallow copy only when we need to sort
    if (sortBy) {
      result = result.slice();
      switch (sortBy) {
        case 'newest':   result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
        case 'oldest':   result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
        case 'priority': result.sort((a, b) => (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0)); break;
        case 'votes':    result.sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0)); break;
        case 'updated':  result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); break;
      }
    }

    return result;
  }, [issues, filters, sortBy]);

  const pageSize      = limit ?? PAGE_SIZE_DEFAULT;
  const totalPages    = Math.ceil(filteredAndSortedIssues.length / pageSize);
  const paginatedIssues = useMemo(
    () => filteredAndSortedIssues.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredAndSortedIssues, currentPage, pageSize]
  );

  // ---------------------------------------------------------------------------
  // Handlers — stable references so IssueCard/Pagination don't re-render
  // ---------------------------------------------------------------------------

  const handleIssueClick = useCallback((issue: Issue) => {
    if (onIssueClick) onIssueClick(issue);
    else router.push(`/issues/${issue.id}`);
  }, [onIssueClick, router]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setCurrentPage(1);
    setActiveChip(0);
  }, [clearFilters]);

  // UX: quick-filter chip handler — sets both status and priority filters
  // and resets to page 1 so users don't land on an empty page
  const handleChipClick = useCallback((idx: number) => {
    const chip = QUICK_FILTERS[idx];
    setActiveChip(idx);
    setCurrentPage(1);
    setFilters({
      ...filters,
      status:   chip.status,
      priority: chip.priority,
    });
  }, [setFilters]);

  // UX: reset to page 1 whenever sort or filters change so users don't get
  // stuck on a now-empty page after narrowing results
  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  }, [setSortBy]);

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-700 text-sm font-medium mb-2">Failed to load issues</p>
        <p className="text-red-600 text-xs mb-3">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Header: title + sort + map button */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        {title && (
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
        )}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {showSort && (
            <IssueSort sortBy={sortBy} onSortChange={handleSortChange} />
          )}
          <button
            onClick={() => router.push('/map')}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <MapIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Map view</span>
            <span className="sm:hidden">Map</span>
          </button>
        </div>
      </div>

      {/* UX: quick-filter chip bar — one-tap filtering without opening a dropdown.
          Sits above the full filter panel so it's always visible. */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {QUICK_FILTERS.map((chip, idx) => (
          <button
            key={chip.label}
            onClick={() => handleChipClick(idx)}
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${activeChip === idx
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Full filter panel — shown when showFilters is true */}
      {showFilters && (
        <IssueFilters filters={filters as any} onFiltersChange={(f: any) => { setFilters(f); setCurrentPage(1); }} />
      )}

      {/* Loading skeleton */}
      {loading ? (
        <SkeletonLoader />
      ) : paginatedIssues.length === 0 ? (
        /* Empty state */
        <EmptyState
          icon={MapIcon}
          title={emptyStateTitle}
          description={
            emptyStateDescription ??
            (filteredAndSortedIssues.length === 0
              ? 'No issues have been reported yet. Be the first!'
              : 'No issues match your current filters.')
          }
          action={
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Clear filters
                </button>
              )}
              <button
                onClick={() => router.push('/issues/new')}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Report an issue
              </button>
            </div>
          }
        />
      ) : (
        <>
          {/* UX: results count + clear link — tells user exactly what they're seeing */}
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium text-gray-700">{paginatedIssues.length}</span> of{' '}
              <span className="font-medium text-gray-700">{filteredAndSortedIssues.length}</span> issues
              {hasActiveFilters && <span className="text-gray-400"> (filtered)</span>}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Issue cards */}
          <div className="grid gap-3">
            {paginatedIssues.map(issue => (
              <IssueCard
                key={issue.id}
                issue={issue}
                showActions={showActions}
                showVoting={showVoting}
                onClick={() => handleIssueClick(issue)}
                onVote={onVote ? () => onVote(issue.id) : undefined}
                isVoted={getUserVoteStatus?.(issue.id) ?? false}
              />
            ))}
          </div>

          {/* Pagination */}
          {showPagination && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default IssueList;