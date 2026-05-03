'use client';

import React from 'react';
import type { Issue } from '@/types/issue.types';

interface TasksStatsProps {
  tasks: Issue[];
}

const TasksStats: React.FC<TasksStatsProps> = ({ tasks }) => {
  const stats = [
    {
      label: 'Total Tasks',
      value: tasks.length,
      color: 'text-gray-900',
      borderColor: 'border-gray-200'
    },
    {
      label: 'Critical',
      value: tasks.filter(t => t.priority === 'critical').length,
      color: 'text-red-600',
      borderColor: 'border-red-200'
    },
    {
      label: 'High Priority',
      value: tasks.filter(t => t.priority === 'high').length,
      color: 'text-orange-600',
      borderColor: 'border-orange-200'
    },
    {
      label: 'Low Priority',
      value: tasks.filter(t => t.priority === 'low').length,
      color: 'text-green-600',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className={`bg-white rounded-lg p-4 text-center border ${stat.borderColor}`}>
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          <div className={`text-sm ${stat.color}`}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default TasksStats;