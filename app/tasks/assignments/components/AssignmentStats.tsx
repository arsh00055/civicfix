'use client';

import React from 'react';
import type { Issue } from '@/types/issue.types';

interface AssignmentsStatsProps {
  assignments: Issue[];
}

const AssignmentsStats: React.FC<AssignmentsStatsProps> = ({ assignments }) => {
  const stats = {
    total: assignments.length,
    resolved: assignments.filter(a => a.status === 'resolved').length,
    inProgress: assignments.filter(a => a.status === 'in_progress').length,
    assigned: assignments.filter(a => a.status === 'assigned').length,
    reported: assignments.filter(a => a.status === 'reported').length
  };

  const statItems = [
    {
      label: 'Total',
      value: stats.total,
      color: 'text-gray-900',
      borderColor: 'border-gray-200'
    },
    {
      label: 'Resolved',
      value: stats.resolved,
      color: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      color: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Assigned',
      value: stats.assigned,
      color: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    {
      label: 'Reported',
      value: stats.reported,
      color: 'text-orange-600',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {statItems.map((stat, index) => (
        <div key={index} className={`bg-white rounded-lg p-4 text-center border ${stat.borderColor}`}>
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          <div className={`text-sm ${stat.color}`}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default AssignmentsStats;