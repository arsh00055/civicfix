'use client';

import React from 'react';

type AchievementTab = 'all' | 'unlocked' | 'locked';

interface AchievementsTabsProps {
  activeTab: AchievementTab;
  onTabChange: (tab: AchievementTab) => void;
  totalCount: number;
  unlockedCount: number;
  lockedCount: number;
}

const AchievementsTabs: React.FC<AchievementsTabsProps> = ({
  activeTab,
  onTabChange,
  totalCount,
  unlockedCount,
  lockedCount
}) => {
  const tabs = [
    { key: 'all' as AchievementTab, label: `All (${totalCount})` },
    { key: 'unlocked' as AchievementTab, label: `Unlocked (${unlockedCount})` },
    { key: 'locked' as AchievementTab, label: `Locked (${lockedCount})` }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AchievementsTabs;