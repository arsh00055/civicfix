'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardIcon } from '@/components/UI/icons';
import type { Issue } from '@/types/issue.types';
import TaskCard from './TaskCard';

interface TasksGridProps {
  tasks: Issue[];
  filteredTasks: Issue[];
  claimingTask: string | null;
  onClaimTask: (taskId: string) => void;
  onClearFilters: () => void;
}

const TasksGrid: React.FC<TasksGridProps> = ({
  tasks,
  filteredTasks,
  claimingTask,
  onClaimTask,
  onClearFilters
}) => {
  const router = useRouter();

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks available</h3>
        <p className="text-gray-600 mb-6">
          {tasks.length === 0 
            ? "There are no available tasks at the moment. Check back later!"
            : "No tasks match your current filters."
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {tasks.length > 0 && (
            <button
              onClick={onClearFilters}
              className="bg-gray-600 text-white cursor-pointer px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
          <button
            onClick={() => router.push('/dashboard')}
            className="border border-gray-300 cursor-pointer text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {filteredTasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          isClaiming={claimingTask === task.id}
          onClaimTask={onClaimTask}
        />
      ))}
    </div>
  );
};

export default TasksGrid;