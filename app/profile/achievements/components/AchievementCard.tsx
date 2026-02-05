'use client';

import React from 'react';
import { TrophyIcon, LockClosedIcon } from '@/components/UI/icons';
import type { Achievement as AchievementType } from '@/types';

interface AchievementCardProps {
  achievement: AchievementType;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const isUnlocked = !!achievement.unlockedAt;

  const getProgressPercentage = (achievement: AchievementType): number => {
    if (!('requirements' in achievement) || !achievement.requirements || achievement.requirements.length === 0) return 0;
    
    const requirement = achievement.requirements[0];
    if (!requirement.current || !requirement.target) return 0;
    
    return Math.round((requirement.current / requirement.target) * 100);
  };

  const getProgressText = (achievement: AchievementType): string => {
    if (!('requirements' in achievement) || !achievement.requirements || achievement.requirements.length === 0) return '';
    
    const requirement = achievement.requirements[0];
    if (!requirement.current || !requirement.target) return '';
    
    return `${requirement.current}/${requirement.target}`;
  };

  const getAchievementIcon = (achievement: AchievementType): string => {
    return achievement.icon || getDefaultIcon(achievement.type);
  };

  const getDefaultIcon = (type: string): string => {
    switch (type) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '🏆';
      default: return '🎯';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const progressPercentage = getProgressPercentage(achievement);
  const progressText = getProgressText(achievement);
  const points = 'points' in achievement ? (achievement as any).points : 0;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 p-6 text-center transition-all relative ${
        isUnlocked
          ? 'border-yellow-400 hover:shadow-md'
          : 'border-gray-200 opacity-90'
      }`}
    >
      {/* Lock Icon for locked achievements */}
      {!isUnlocked && (
        <div className="absolute top-4 right-4">
          <LockClosedIcon className="h-5 w-5 text-gray-400" />
        </div>
      )}

      {/* Icon */}
      <div className={`text-4xl mb-4 ${
        isUnlocked ? '' : 'grayscale opacity-75'
      }`}>
        {getAchievementIcon(achievement)}
      </div>

      {/* Type Badge */}
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border mb-3 ${getTypeColor(achievement.type)}`}>
        {achievement.type.charAt(0).toUpperCase() + achievement.type.slice(1)}
      </div>

      {/* Content */}
      <h3 className="font-semibold text-gray-900 mb-2">{achievement.name}</h3>
      <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>

      {/* Progress Bar */}
      {!isUnlocked && progressText && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{progressText}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${progressPercentage}%`
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Points */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        isUnlocked
          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}>
        <TrophyIcon className="h-4 w-4 mr-1" />
        {points} pts
      </div>

      {/* Unlocked Date */}
      {isUnlocked && achievement.unlockedAt && (
        <div className="text-xs text-gray-500 mt-3">
          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default AchievementCard;