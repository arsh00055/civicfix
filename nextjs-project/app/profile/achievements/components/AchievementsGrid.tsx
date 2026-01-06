'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TrophyIcon } from '@/components/UI/icons';
import type { Achievement as AchievementType } from '@/types';
import AchievementCard from './AchievementCard';

type AchievementTab = 'all' | 'unlocked' | 'locked';

interface AchievementsGridProps {
  achievements: AchievementType[];
  activeTab: AchievementTab;
  onReportIssue: () => void;
}

const AchievementsGrid: React.FC<AchievementsGridProps> = ({
  achievements,
  activeTab,
  onReportIssue
}) => {
  const router = useRouter();

  if (achievements.length === 0) {
    return (
      <div className="text-center py-12">
        <TrophyIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
        <p className="text-gray-600 mb-4">
          {activeTab === 'unlocked' 
            ? "You haven't unlocked any achievements yet. Start reporting issues to earn badges!"
            : "No achievements match your current filter."
          }
        </p>
        {activeTab === 'unlocked' && (
          <button
            onClick={onReportIssue}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Report Your First Issue
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {achievements.map(achievement => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
        />
      ))}
    </div>
  );
};

export default AchievementsGrid;