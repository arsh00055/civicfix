import React, { useState, useEffect, Suspense } from 'react';
import { volunteersAPI } from '../../../services/api/endpoints';
import Sidebar from '../../../components/layout/sidebar/Sidebar';
import Header from '../../../components/layout/Header/Header';
import { useAppSelector } from '../../../app/store/hooks';
import type { Issue } from '../../../types';

// Lazy-loaded components
import {
  AvailableTasksHeader,
  ErrorBanner,
  TasksStats,
  TasksFilters,
  TasksGrid,
  LoadingState,
  ErrorState
} from './components/lazy';

interface AvailableTasksProps {
  role: string | null;
}

type Priority = 'low' | 'medium' | 'high' | 'critical';

const AvailableTasksPage: React.FC<AvailableTasksProps> = ({ role }) => {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const [tasks, setTasks] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingTask, setClaimingTask] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    priority: '' as Priority | '',
    search: ''
  });

  useEffect(() => {
    fetchAvailableTasks();
  }, [filters]);

  const fetchAvailableTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await volunteersAPI.getAvailableTasks();
      setTasks(response.data.tasks);
      
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Failed to load available tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTask = async (taskId: string) => {
    try {
      setClaimingTask(taskId);
      
      await volunteersAPI.claimTask(taskId);
      
      // Remove claimed task from the list
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
    } catch (err) {
      console.error('Failed to claim task:', err);
      setError('Failed to claim task. Please try again.');
    } finally {
      setClaimingTask(null);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handlePriorityFilter = (priority: Priority | '') => {
    setFilters(prev => ({ ...prev, priority }));
  };

  const clearFilters = () => {
    setFilters({ category: '', priority: '', search: '' });
  };

  const handleRetry = () => {
    fetchAvailableTasks();
  };

  const filteredTasks = tasks.filter(task => {
    let matches = true;
    if (filters.category && task.category !== filters.category) matches = false;
    if (filters.priority && task.priority !== filters.priority) matches = false;
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) matches = false;
    return matches;
  });

  // Loading state
  if (loading && !tasks.length) {
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarOpen && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={role} />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <LoadingState />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  // Error state (when no data exists)
  if (error && !tasks.length) {
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarOpen && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={role} />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <ErrorState error={error} onRetry={handleRetry} />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole={role} />
        <main className="flex-1 overflow-auto p-6">
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <Suspense fallback={<div>Loading header...</div>}>
                <AvailableTasksHeader onRefresh={handleRetry} />
              </Suspense>

              {/* Error Banner */}
              <Suspense fallback={<div>Loading error banner...</div>}>
                <ErrorBanner error={error} onRetry={handleRetry} />
              </Suspense>

              {/* Stats */}
              <Suspense fallback={<div>Loading stats...</div>}>
                <TasksStats tasks={tasks} />
              </Suspense>

              {/* Filters */}
              <Suspense fallback={<div>Loading filters...</div>}>
                <TasksFilters
                  filters={filters}
                  onCategoryFilter={handleCategoryFilter}
                  onPriorityFilter={handlePriorityFilter}
                  onSearch={handleSearch}
                  onClearFilters={clearFilters}
                />
              </Suspense>

              {/* Tasks Grid */}
              <Suspense fallback={<div>Loading tasks...</div>}>
                <TasksGrid
                  tasks={tasks}
                  filteredTasks={filteredTasks}
                  claimingTask={claimingTask}
                  onClaimTask={handleClaimTask}
                  onClearFilters={clearFilters}
                />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AvailableTasksPage;