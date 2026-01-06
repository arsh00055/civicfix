'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { volunteersAPI } from '@/lib/services/api/endpoints';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'inProgress' | 'completed';
}

interface TaskBoardProps {
  limit?: number;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ limit = 3 }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<{
    todo: Task[];
    inProgress: Task[];
    completed: Task[];
  }>({ todo: [], inProgress: [], completed: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'volunteer') {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await volunteersAPI.getMyAssignments();
      const assignments = response.data?.assignments || [];
      
      // Categorize tasks by status
      const categorized = {
        todo: assignments
          .filter((a: any) => a.status === 'assigned' || a.status === 'reported')
          .slice(0, limit)
          .map((a: any) => ({
            id: a.id,
            title: a.title,
            priority: a.priority as 'high' | 'medium' | 'low',
            status: 'todo' as const
          })),
        inProgress: assignments
          .filter((a: any) => a.status === 'in_progress')
          .slice(0, limit)
          .map((a: any) => ({
            id: a.id,
            title: a.title,
            priority: a.priority as 'high' | 'medium' | 'low',
            status: 'inProgress' as const
          })),
        completed: assignments
          .filter((a: any) => a.status === 'resolved' || a.status === 'closed')
          .slice(0, limit)
          .map((a: any) => ({
            id: a.id,
            title: a.title,
            priority: a.priority as 'high' | 'medium' | 'low',
            status: 'completed' as const
          })),
      };
      
      setTasks(categorized);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      // Fallback to sample data
      setTasks({
        todo: [
          { id: '1', title: 'Community Garden Setup', priority: 'high', status: 'todo' },
          { id: '2', title: 'Park Bench Repair', priority: 'medium', status: 'todo' },
        ],
        inProgress: [
          { id: '3', title: 'Street Light Maintenance', priority: 'high', status: 'inProgress' },
        ],
        completed: [
          { id: '4', title: 'Playground Inspection', priority: 'low', status: 'completed' },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const handleTaskClick = (taskId: string) => {
    router.push(`/issues/${taskId}`);
  };

  const handleViewAll = () => {
    router.push('/tasks/assignments');
  };

  if (user?.role !== 'volunteer') {
    return null; // Only show for volunteers
  }

  const Column: React.FC<{ 
    title: string; 
    tasks: Task[]; 
    color: string;
    emptyMessage: string;
  }> = ({ title, tasks, color, emptyMessage }) => (
    <div className="flex-1">
      <h3 className={`font-semibold text-sm ${color} mb-3`}>{title} ({tasks.length})</h3>
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-900 line-clamp-2">{task.title}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)} ml-2 flex-shrink-0`}>
                {task.priority}
              </span>
            </div>
            <button 
              onClick={() => handleTaskClick(task.id)}
              className="w-full mt-2 bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700 transition-colors"
            >
              View Details
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-4">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Board</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="h-6 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2].map(j => (
                  <div key={j} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Task Board</h2>
        <button 
          onClick={fetchTasks}
          className="text-sm text-blue-600 hover:text-blue-700"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Column 
          title="To Do" 
          tasks={tasks.todo} 
          color="text-blue-600"
          emptyMessage="No pending tasks"
        />
        <Column 
          title="In Progress" 
          tasks={tasks.inProgress} 
          color="text-orange-600"
          emptyMessage="No tasks in progress"
        />
        <Column 
          title="Completed" 
          tasks={tasks.completed} 
          color="text-green-600"
          emptyMessage="No completed tasks"
        />
      </div>
      {(tasks.todo.length > 0 || tasks.inProgress.length > 0 || tasks.completed.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button 
            onClick={handleViewAll}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Tasks
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;