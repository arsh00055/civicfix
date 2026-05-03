'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Loading from '@/app/loading';
import Error from '@/app/error';
import { useAuth } from '@/features/auth/hooks/useAuth';
import apiClient from '@/lib/services/api/client';
import FindTasksHeader from './components/FindTasksHeader';
import TasksStats from './components/TasksStats';
import TasksFilters from './components/TasksFilters';
import TasksGrid from './components/TasksGrid';
import { Issue } from '@/types/issue.types';
import { toast } from 'sonner';

type Priority = 'low' | 'medium' | 'high' | 'critical';
type Urgency = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  location: string;
  distance: string;
  estimatedTime: string;
  skillsRequired: string[];
  reportedBy: string;
  createdAt: string;
  urgency: Urgency;
  status?: string;
  votes?: number;
  commentCount?: number;
}

const FindTasksPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingTask, setClaimingTask] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    priority: '' as Priority | '',
    urgency: '' as Urgency | '',
    search: '',
    distance: ''
  });

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; fetchTasks(); return; }
    const t = setTimeout(fetchTasksWithFilters, 300);
    return () => clearTimeout(t);
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || user.role !== 'volunteer') {
        setError('Only volunteers can find tasks');
        return;
      }

      // Fetch tasks from the find endpoint
      const response = await apiClient.get('/volunteers/tasks/search');
      const data = response.data || response;
      setTasks(data.tasks || []);
      
    } catch (err) {
      toast.error('Failed to fetch tasks');
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksWithFilters = async () => {
    try {
      setLoading(true);
      
      if (!user || user.role !== 'volunteer') {
        return;
      }

      // Build query parameters from filters
      const params: Record<string, string> = {};
      if (filters.category) params.category = filters.category;
      if (filters.priority) params.priority = filters.priority;
      if (filters.urgency) params.urgency = filters.urgency;
      if (filters.search) params.search = filters.search;
      if (filters.distance) params.distance = filters.distance;

      // Note: Your Mockoon endpoint might not support all these filters
      // In a real app, the backend would handle filtering
      const response = await apiClient.get('/volunteers/tasks/search', { params });
      const data = response.data || response;
      setTasks(data.tasks || []);
      
    } catch (err) {
      toast.error('Failed to fetch filtered tasks');
      // If filtered request fails, use client-side filtering
      fetchTasks();
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTask = async (taskId: string) => {
    try {
      setClaimingTask(taskId);
      setError(null);
      
      // First try to claim as a task
      try {
        await apiClient.post(`/volunteers/tasks/${taskId}/claim`);
      } catch (taskClaimErr) {
        // If that fails, try to claim as an issue
        console.log('Trying to claim as issue...');
        await apiClient.post(`/issues/${taskId}/claim`);
      }
      
      // Remove claimed task from list
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Show success message
      toast.success('Task claimed successfully! You can now view it in your assignments.');
      
    } catch (err) {
      toast.error('Failed to claim task');
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

  const handleUrgencyFilter = (urgency: Urgency | '') => {
    setFilters(prev => ({ ...prev, urgency }));
  };

  const handleDistanceFilter = (distance: string) => {
    setFilters(prev => ({ ...prev, distance }));
  };

  const clearFilters = () => {
    setFilters({ category: '', priority: '', urgency: '', search: '', distance: '' });
  };

  const handleRetry = () => {
    fetchTasks();
  };

  // Client-side filtering for fallback
  const filteredTasks = tasks.filter(task => {
    let matches = true;
    
    if (filters.category && task.category !== filters.category) matches = false;
    if (filters.priority && task.priority !== filters.priority) matches = false;
    if (filters.urgency && task.urgency !== filters.urgency) matches = false;
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      matches = matches && (
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.location.toLowerCase().includes(searchLower) ||
        (task.skillsRequired && task.skillsRequired.some(skill => 
          skill.toLowerCase().includes(searchLower)
        ))
      );
    }
    
    if (filters.distance) {
      // Simple distance filtering - in a real app, this would be based on coordinates
      const taskDistance = parseFloat(task.distance?.replace(' miles', '') || '0');
      const filterDistance = parseFloat(filters.distance);
      matches = matches && taskDistance <= filterDistance;
    }
  
    return matches;
  });

  if (!user || user.role !== 'volunteer') {
    return (
      <MainLayout role={user?.role ?? null}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Volunteer Access Required</h2>
              <p className="text-gray-600 mb-6">
                This page is only accessible to volunteers. If you're a volunteer, please log in with your volunteer account.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role={user?.role}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <FindTasksHeader 
            onRefresh={handleRetry}
            totalTasks={tasks.length}
            filteredTasks={filteredTasks.length}
            hasFilters={!!(filters.search || filters.category || filters.priority || filters.urgency || filters.distance)}
          />

          {/* Error Banner */}
          {error && (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />)}

          {/* Loading State */}
          {loading && tasks.length === 0 && (<Loading />)}

          {/* Content */}
          {!loading && (
            <>
              <TasksStats tasks={tasks as unknown as Issue[]} />

              {/* Filters - Updated with more options */}
              <TasksFilters
                filters={filters}
                onCategoryFilter={handleCategoryFilter}
                onPriorityFilter={handlePriorityFilter}
                onSearch={handleSearch}
                onClearFilters={clearFilters}
              />

              {/* Results Count */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredTasks.length} of {tasks.length} tasks
                  {filters.search || filters.category || filters.priority || filters.urgency || filters.distance ? 
                    ' (filtered)' : ''
                  }
                </p>
                {(filters.search || filters.category || filters.priority || filters.urgency || filters.distance) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm cursor-pointer text-blue-600 hover:text-blue-700"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* Tasks Grid */}
              <TasksGrid
                tasks={tasks as unknown as Issue[]}
                filteredTasks={filteredTasks as unknown as Issue[]}
                claimingTask={claimingTask}
                onClaimTask={handleClaimTask}
                onClearFilters={clearFilters} 
              />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default FindTasksPage;