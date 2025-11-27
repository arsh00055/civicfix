import React, { useState, useMemo } from 'react';
import { useIssues } from '../../hooks/useIssue';
import { useIssueFilters} from '../../hooks/useIssueFilters';
import IssueCard from '../../../../components/UI/cards/IssueCard';
import IssueFilters from './IssueFilters';
import IssueSort from './IssueSort';
import Pagination from '../../../../components/common/Pagination';
import EmptyState from '../../../../components/common/EmptyState';
import SkeletonLoader from '../../../../components/UI/loading/SkeletonLoader';
import { MapIcon } from '../../../../components/UI/icons';
import type { Issue } from '../../../../types';

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
  onIssueClick
}) => {
  // Use external issues if provided, otherwise use internal hook
  const internalIssues = useIssues();
  const issues = externalIssues || internalIssues.issues;
  const loading = externalIssues ? false : internalIssues.loading;
  const error = externalIssues ? null : internalIssues.error;
  
  const { filters, setFilters, sortBy, setSortBy, clearFilters, hasActiveFilters } = useIssueFilters();
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedIssues = useMemo(() => {
    let result = [...issues];

    // Apply filters
    if (filters.status && filters.status !== '') {
      result = result.filter(issue => issue.status === filters.status);
    }
    if (filters.category && filters.category !== '') {
      result = result.filter(issue => issue.category === filters.category);
    }
    if (filters.priority && filters.priority !== '') {
      result = result.filter(issue => issue.priority === filters.priority);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(issue => 
        issue.title.toLowerCase().includes(searchLower) ||
        issue.description.toLowerCase().includes(searchLower) ||
        issue.location.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        result.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
        break;
      case 'votes':
        result.sort((a, b) => (b.votes || 0) - (a.votes || 0));
        break;
      case 'updated':
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    return result;
  }, [issues, filters, sortBy]);

  // Apply pagination
  const pageSize = limit || 10;
  const totalPages = Math.ceil(filteredAndSortedIssues.length / pageSize);
  const paginatedIssues = filteredAndSortedIssues.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleIssueClick = (issue: Issue) => {
    if (onIssueClick) {
      onIssueClick(issue);
    } else {
      window.location.href = `/issues/${issue.id}`;
    }
  };

  const handleReportIssue = () => {
    window.location.href = '/report-issue';
  };

  const handleClearFilters = () => {
    clearFilters();
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error loading issues: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center space-x-4">
          {showSort && <IssueSort sortBy={sortBy} onSortChange={setSortBy} />}
          <button 
            onClick={() => window.location.href = '/map'}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MapIcon className="h-4 w-4" />
            <span>View on Map</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <IssueFilters 
          filters={filters} 
          onFiltersChange={setFilters}
        />
      )}

      {/* Content */}
      {loading ? (
        <SkeletonLoader type="card" count={5} />
      ) : paginatedIssues.length === 0 ? (
        <EmptyState
          icon={MapIcon}
          title={emptyStateTitle}
          description={emptyStateDescription || (
            filteredAndSortedIssues.length === 0 ? 
            "There are no issues reported yet. Be the first to report one!" :
            "No issues match your current filters. Try adjusting your search criteria."
          )}
          action={
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {hasActiveFilters && (
                <button 
                  onClick={handleClearFilters}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <button 
                onClick={handleReportIssue}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Report First Issue
              </button>
            </div>
          }
        />
      ) : (
        <>
          {/* Results Count */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {paginatedIssues.length} of {filteredAndSortedIssues.length} issues
            </p>
            {hasActiveFilters && (
              <button 
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Issues Grid */}
          <div className="grid gap-4">
            {paginatedIssues.map(issue => (
              <IssueCard 
                key={issue.id} 
                issue={issue}
                showActions={showActions}
                showVoting={showVoting}
                onClick={() => handleIssueClick(issue)}
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