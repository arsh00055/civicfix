'use client';

import React from 'react';
import type { Issue } from '@/types';

interface ReportsStatsProps {
  reports: Issue[];
}

const ReportsStats: React.FC<ReportsStatsProps> = ({ reports }) => {
  const getStatusStats = () => {
    return {
      reported: reports.filter(r => r.status === 'reported').length,
      in_progress: reports.filter(r => r.status === 'in_progress').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      total: reports.length
    };
  };

  const stats = getStatusStats();

  const statItems = [
    {
      label: 'Total Reports',
      value: stats.total,
      color: 'text-gray-900',
      borderColor: 'border-gray-200'
    },
    {
      label: 'Reported',
      value: stats.reported,
      color: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    {
      label: 'In Progress',
      value: stats.in_progress,
      color: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Resolved',
      value: stats.resolved,
      color: 'text-green-600',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((stat, index) => (
        <div key={index} className={`bg-white rounded-lg p-4 text-center border ${stat.borderColor}`}>
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          <div className={`text-sm ${stat.color}`}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default ReportsStats;