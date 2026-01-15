'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Loading from '@/app/loading';
import Error from '@/app/error';
import { useAuth } from '@/features/auth/hooks/useAuth';
import apiClient from '@/lib/services/api/client';

const AvailableTasksPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingTask, setClaimingTask] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAvailableTasks();
    }
  }, [user]);

  const fetchAvailableTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || user.role !== 'volunteer') {
        setError('Only volunteers can view available tasks');
        return;
      }

      const response = await apiClient.get('/volunteers/tasks/available');
      const data = response.data || response;
      setTasks(data.tasks || []);
      
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
      setError(null);
      
      await apiClient.post(`/volunteers/tasks/${taskId}/claim`);
      
      // Remove claimed task from the list
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Show success message
      alert('Task claimed successfully!');
      
    } catch (err) {
      console.error('Failed to claim task:', err);
      setError('Failed to claim task. Please try again.');
    } finally {
      setClaimingTask(null);
    }
  };

  const handleRetry = () => {
    fetchAvailableTasks();
  };

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
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role={user?.role}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Available Tasks</h1>
                  <p className="text-gray-600 mt-1">
                    {tasks.length > 0 
                      ? `${tasks.length} task${tasks.length !== 1 ? 's' : ''} available`
                      : 'No available tasks'
                    }
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleRetry}
                className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && tasks.length === 0 && (<Loading />)}

          {/* Error State */}
          {error && !loading && (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />)}

          {/* Empty State */}
          {!loading && !error && tasks.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No available tasks</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                All current tasks have been claimed. Check back later for new opportunities.
              </p>
              <button
                onClick={handleRetry}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Check Again
              </button>
            </div>
          )}

          {/* Tasks Grid */}
          {!loading && !error && tasks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map(task => (
                <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{task.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {task.category?.toUpperCase() || 'GENERAL'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{task.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{task.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{task.estimatedTime}</span>
                    </div>
                    
                    {task.reportedBy && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Reported by: {task.reportedBy}</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleClaimTask(task.id)}
                    disabled={claimingTask === task.id}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {claimingTask === task.id ? 'Claiming...' : 'Claim Task'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AvailableTasksPage;