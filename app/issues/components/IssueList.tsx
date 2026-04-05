'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Issue } from '@/types';
import IssueCard from '@/components/UI/cards/IssueCard';
import IssueFilters from './IssueFilters';
import IssueSort from './IssueSort';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import { MapIcon } from '@/components/UI/icons';
import { useIssues } from '@/features/issues/hooks/useIssue';
import { useIssueFilters } from '@/features/issues/hooks/useIssueFilters';
import { SkeletonLoader } from '@/app/loading';

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

const IssueList: React.FC<IssueListProps> = ({
  issues: externalIssues,
  showFilters = true,
  showSort = true,
  showPagination = true,
  showActions = true,
  showVoting = true,
  limit,
  title = "Community Issues",
  emptyStateTitle = "No issues found",
  emptyStateDescription,
  onIssueClick,
  onVote,
  getUserVoteStatus,
}) => {
  const router = useRouter();
  const internalIssues = useIssues();
  const issues = externalIssues || internalIssues.issues || [];
  const loading = externalIssues ? false : internalIssues.loading;
  const error = externalIssues ? null : internalIssues.error;
  const { filters, setFilters, sortBy, setSortBy, clearFilters, hasActiveFilters } = useIssueFilters();
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedIssues = useMemo(() => {
    let result = [...issues];
    if (filters.status && filters.status !== 'all') result = result.filter(i => i.status === filters.status);
    if (filters.category && filters.category !== 'all') result = result.filter(i => i.category === filters.category);
    if (filters.priority && filters.priority !== 'all') result = result.filter(i => i.priority === filters.priority);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(i => i.title.toLowerCase().includes(s) || i.description.toLowerCase().includes(s) || i.location.toLowerCase().includes(s));
    }
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    switch (sortBy) {
      case 'newest': result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'oldest': result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case 'priority': result.sort((a, b) => (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)); break;
      case 'votes': result.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)); break;
      case 'updated': result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); break;
    }
    return result;
  }, [issues, filters, sortBy]);

  const pageSize = limit || 10;
  const totalPages = Math.ceil(filteredAndSortedIssues.length / pageSize);
  const paginatedIssues = filteredAndSortedIssues.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleIssueClick = (issue: Issue) => {
    if (onIssueClick) onIssueClick(issue);
    else router.push(`/issues/${issue.id}`);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error loading issues: {error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* FIX: flex-wrap so sort + map button wraps on mobile instead of overflowing */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {showSort && <IssueSort sortBy={sortBy} onSortChange={setSortBy} />}
          <button
            onClick={() => router.push('/map')}
            className="flex cursor-pointer items-center space-x-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <MapIcon className="h-4 w-4" />
            <span className="hidden sm:inline">View on Map</span>
            <span className="sm:hidden">Map</span>
          </button>
        </div>
      </div>

      {showFilters && <IssueFilters filters={filters as any} onFiltersChange={setFilters} />}

      {loading ? (
        <SkeletonLoader />
      ) : paginatedIssues.length === 0 ? (
        <EmptyState
          icon={MapIcon}
          title={emptyStateTitle}
          description={emptyStateDescription || (filteredAndSortedIssues.length === 0 ? "There are no issues reported yet. Be the first to report one!" : "No issues match your current filters.")}
          action={
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {hasActiveFilters && (
                <button onClick={() => { clearFilters(); setCurrentPage(1); }} className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">Clear Filters</button>
              )}
              <button onClick={() => router.push('/issues/new')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Report First Issue</button>
            </div>
          }
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Showing {paginatedIssues.length} of {filteredAndSortedIssues.length} issues</p>
            {hasActiveFilters && (
              <button onClick={() => { clearFilters(); setCurrentPage(1); }} className="text-sm text-blue-600 hover:text-blue-500 transition-colors">Clear all filters</button>
            )}
          </div>
          <div className="grid gap-4">
            {paginatedIssues.map(issue => (
              <IssueCard
                key={issue.id}
                issue={issue}
                showActions={showActions}
                showVoting={showVoting}
                onClick={() => handleIssueClick(issue)}
                onVote={onVote ? () => onVote(issue.id) : undefined}
                isVoted={getUserVoteStatus ? getUserVoteStatus(issue.id) : false}
              />
            ))}
          </div>
          {showPagination && totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </>
      )}
    </div>
  );
};

export default IssueList;
