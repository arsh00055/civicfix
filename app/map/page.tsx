'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import MainLayout from '@/components/layout/MainLayout';
import Loading from '@/app/loading'
import Error from '@/app/error'
import { issuesAPI } from '@/lib/services/api/endpoints';
import type { Issue } from '@/types/issue.types';
import { useAuth } from '@/features/auth/hooks/useAuth';

const MapComponent = dynamic(() => import('@/components/map/mapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <Loading />
    </div>
  )
});

interface MapIssue extends Issue {
  latitude: number;
  longitude: number;
}

const MapPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [issues, setIssues] = useState<MapIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredIssues, setFilteredIssues] = useState<MapIssue[]>([]);
  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all',
    status: 'all'
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    filterIssues();
  }, [issues, filters]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await issuesAPI.getIssues();
      const issuesData = response.data?.issues || response.data || [];
      
      // Filter issues that have valid coordinates
      const validIssues = issuesData.filter((issue: any) => 
        issue.latitude && issue.longitude &&
        typeof issue.latitude === 'number' && 
        issue.status !== 'resolved' &&
        typeof issue.longitude === 'number'
      );
      
      setIssues(validIssues);
      
    } catch (err) {
      console.error('Failed to fetch issues:', err);
      setError('Failed to load issues map data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterIssues = () => {
    let filtered = issues;

    if (filters.category !== 'all') {
      filtered = filtered.filter(issue => issue.category === filters.category);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(issue => issue.priority === filters.priority);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }

    setFilteredIssues(filtered);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleRetry = () => {
    fetchIssues();
  };

  const handleClearFilters = () => {
    setFilters({ category: 'all', priority: 'all', status: 'all' });
  };

  const handleIssueClick = (issue: MapIssue) => {
    router.push(`/issues/${issue.id}?role=` + (user?.role || ''));
  };

  if (loading) {
    return (
      <MainLayout role={user?.role || null}>
        <div className="h-screen flex items-center justify-center">
          <Loading />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role={user?.role || null}>
      <div className="h-screen flex flex-col">
        <div className="px-6 pt-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community Issues Map</h1>
              <p className="text-gray-600 mt-1">
                View and track {filteredIssues.length} community issues in your area
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-700">Critical</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-700">High</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-700">Medium</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-700">Low</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 pb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 items-center">
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full cursor-pointer text-black sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="safety">Safety</option>
                  <option value="sanitation">Sanitation</option>
                  <option value="utilities">Utilities</option>
                  <option value="environment">Environment</option>
                </select>
              </div>

              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full cursor-pointer text-black sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full cursor-pointer text-black sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="reported">Reported</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="w-full sm:w-auto">
                <label className="block h-5 text-sm font-medium text-gray-700 mb-1"></label>
                <button
                  onClick={handleClearFilters}
                  className="w-full cursor-pointer sm:w-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>

              <div className="w-full sm:w-auto text-sm text-gray-600">
                Showing {filteredIssues.length} of {issues.length} issues
              </div>
            </div>
          </div>
        </div>

        {error && (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />)}

        <div className="flex-1 px-6 pb-6">
          <div className="h-full rounded-xl overflow-hidden z-10 border border-gray-200 bg-gray-50 relative">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loading />
              </div>
            ) : (
              <MapComponent 
                issues={filteredIssues}
                onIssueClick={handleIssueClick}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MapPage;