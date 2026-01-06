'use client';

import React from 'react';
import type { Achievement as AchievementType } from '@/types';

interface AchievementsStatsProps {
  achievements: AchievementType[];
}

const AchievementsStats: React.FC<AchievementsStatsProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalPoints = achievements
    .filter(a => a.unlockedAt)
    .reduce((sum, a) => {
      const points = 'points' in a ? (a as any).points : 0;
      return sum + points;
    }, 0);

  const stats = [
    {
      label: 'Achievements Unlocked',
      value: unlockedCount,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600'
    },
    {
      label: 'Total Points',
      value: totalPoints,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-600'
    },
    {
      label: 'Total Available',
      value: achievements.length,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-lg p-4 text-center border ${stat.borderColor}`}>
          <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
          <div className={`text-sm ${stat.textColor}`}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default AchievementsStats;