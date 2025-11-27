import React from 'react';
import Achievement3D from '../../../components/three/Achievement3D';
import type { Achievement } from '../../../types';

const AchievementsSection: React.FC = () => {
  // Mock achievements data
  const achievements: Achievement[] = [
    {
      id: 'first_issue',
      name: 'First Issue Reporter',
      description: 'Reported your first community issue',
      icon: '🎯',
      type: 'bronze',
      unlockedAt: '2024-01-10T08:00:00Z',
    },
    {
      id: 'community_helper',
      name: 'Community Helper',
      description: 'Reported 10+ issues that were resolved',
      icon: '🌟',
      type: 'silver',
      unlockedAt: '2024-01-15T14:20:00Z',
    },
    {
      id: 'issue_resolver',
      name: 'Issue Resolver',
      description: 'Help resolve 5 community issues',
      icon: '🔧',
      type: 'gold',
      progress: 3,
      total: 5,
    },
    {
      id: 'community_champion',
      name: 'Community Champion',
      description: 'Top contributor for 3 consecutive months',
      icon: '🏆',
      type: 'platinum',
    },
  ];

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'bronze': return 'bg-amber-100 border-amber-200';
      case 'silver': return 'bg-gray-100 border-gray-200';
      case 'gold': return 'bg-yellow-100 border-yellow-200';
      case 'platinum': return 'bg-purple-100 border-purple-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'bronze': return 'Bronze';
      case 'silver': return 'Silver';
      case 'gold': return 'Gold';
      case 'platinum': return 'Platinum';
      default: return type;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Achievements</h2>
        <span className="text-sm text-gray-600">
          {achievements.filter(a => a.unlockedAt).length} of {achievements.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className={`border-2 rounded-xl p-4 text-center transition-transform hover:scale-105 ${
              achievement.unlockedAt 
                ? getAchievementColor(achievement.type) 
                : 'bg-gray-50 border-gray-200 opacity-60'
            }`}
          >
            {/* 3D Achievement Display */}
            <div className="flex justify-center mb-3">
              {achievement.unlockedAt ? (
                <Achievement3D 
                  type={achievement.type as any} 
                  className="h-16 w-16"
                />
              ) : (
                <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                  <span className="text-2xl">🔒</span>
                </div>
              )}
            </div>

            <h3 className="font-semibold text-gray-900 mb-1">{achievement.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
            
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-1 rounded-full ${
                achievement.unlockedAt 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {getTypeDisplay(achievement.type)}
              </span>

              {achievement.unlockedAt ? (
                <span className="text-green-600 font-medium">Unlocked</span>
              ) : achievement.progress !== undefined ? (
                <span className="text-blue-600">
                  {achievement.progress}/{achievement.total}
                </span>
              ) : (
                <span className="text-gray-500">Locked</span>
              )}
            </div>

            {/* Progress Bar */}
            {achievement.progress !== undefined && !achievement.unlockedAt && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${(achievement.progress / (achievement.total || 1)) * 100}%` 
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No achievements yet. Start contributing to earn achievements!</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsSection;