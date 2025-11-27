import React, { Suspense, useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import PageLoader from '../../components/UI/loading/PageLoader';
import { issuesAPI } from '../../services/api/endpoints';
import type { Issue } from '../../types';

const MapComponent = React.lazy(() => import('../../components/map/mapComponent'));

interface MapPageProps {
  userRole: string | null;
}

interface MapIssue extends Issue {
  latitude: number;
  longitude: number;
}

const MapPage: React.FC<MapPageProps> = ({ userRole }) => {
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
      const issuesData = response.data.issues || response.data || [];
      
      // Filter issues that have valid coordinates
      const validIssues = issuesData.filter((issue: any) => 
        issue.latitude && issue.longitude &&
        typeof issue.latitude === 'number' && 
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

  // Color functions for MapComponent
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626'; // red-600
      case 'high': return '#ea580c';     // orange-600
      case 'medium': return '#ca8a04';   // yellow-600
      case 'low': return '#16a34a';      // green-600
      default: return '#6b7280';         // gray-500
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return '#16a34a';     // green-600
      case 'in_progress': return '#2563eb';  // blue-600
      case 'assigned': return '#9333ea';     // purple-600
      case 'reported': return '#ca8a04';     // yellow-600
      default: return '#6b7280';             // gray-500
    }
  };

  const handleIssueClick = (issue: MapIssue) => {
    // Navigate to issue detail page
    window.location.href = `/issues/${issue.id}`;
  };

  if (loading) {
    return (
      <MainLayout role={userRole}>
        <div className="h-full flex items-center justify-center">
          <PageLoader />
        </div>
      </MainLayout>
    );
  }

  if (error && issues.length === 0) {
    return (
      <MainLayout role={userRole}>
        <div className="h-full flex flex-col items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-6xl mb-4">🗺️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Map Loading Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role={userRole}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community Issues Map</h1>
              <p className="text-gray-600 mt-2">
                View and track {filteredIssues.length} community issues in your area
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Critical</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>High</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="safety">Safety</option>
                <option value="sanitation">Sanitation</option>
                <option value="utilities">Utilities</option>
                <option value="environment">Environment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="reported">Reported</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="flex-1"></div>

            <div className="text-sm text-gray-600">
              Showing {filteredIssues.length} of {issues.length} issues
            </div>

            <button
              onClick={() => setFilters({ category: 'all', priority: 'all', status: 'all' })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-600 text-sm">{error}</span>
              </div>
              <button
                onClick={handleRetry}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <Suspense fallback={
            <div className="h-full flex items-center justify-center">
              <PageLoader />
            </div>
          }>
            <MapComponent 
              role={userRole}
              issues={filteredIssues}
              onIssueClick={handleIssueClick}
              getPriorityColor={getPriorityColor}
              getStatusColor={getStatusColor}
            />
          </Suspense>
        </div>
      </div>
    </MainLayout>
  );
};

export default MapPage;