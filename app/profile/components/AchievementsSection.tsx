'use client';

import React, { useState, useEffect, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { TrophyIcon, FireIcon, StarIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import type { Achievement } from '@/types';
import { achievementsAPI } from '@/lib/services/api/endpoints';
import { useAuth } from '@/features/auth/hooks/useAuth';
import Loading from '@/app/loading';
import Error from '@/app/error';

const TIER_STYLES: Record<string, { bg: string; text: string; border: string; icon: JSX.Element }> = {
  bronze: { 
    bg: "bg-orange-100", 
    text: "text-orange-800", 
    border: "border-orange-200",
    icon: <FireIcon className="w-4 h-4" />
  },
  silver: { 
    bg: "bg-gray-100", 
    text: "text-gray-700", 
    border: "border-gray-200",
    icon: <StarIcon className="w-4 h-4" />
  },
  gold: { 
    bg: "bg-yellow-100", 
    text: "text-yellow-800", 
    border: "border-yellow-200",
    icon: <TrophyIcon className="w-4 h-4" />
  },
  platinum: { 
    bg: "bg-purple-100", 
    text: "text-purple-800", 
    border: "border-purple-200",
    icon: <SparklesIcon className="w-4 h-4" />
  },
};

const AchievementsSection: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) return;

      const response = await achievementsAPI.getUserAchievements(user.id);
      setAchievements(response.data || []);
      
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'bronze': return 'bg-orange-100 border-orange-200';
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

  const handleViewAllAchievements = () => {
    router.push('/profile/achievements');
  };

  const handleAchievementClick = (achievement: Achievement) => {
    console.log('Achievement clicked:', achievement);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => fetchAchievements()} />;
  }

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const displayAchievements = achievements.slice(0, 4);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Achievements</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {unlockedCount} of {achievements.length} unlocked
          </span>
          <button 
            onClick={handleViewAllAchievements}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            View All →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayAchievements.map(achievement => {
          const hasProgress = achievement.progress && typeof achievement.progress === 'object';
          const current = hasProgress ? achievement.progress!.current : 0;
          const target = hasProgress ? achievement.progress!.target : 0;
          const isUnlocked = !!achievement.unlockedAt;
          const progressPercent = target > 0 ? Math.round((current / target) * 100) : 0;
          const tierStyle = TIER_STYLES[achievement.type] || TIER_STYLES.bronze;
          
          return (
            <div
              key={achievement.id}
              onClick={() => handleAchievementClick(achievement)}
              className={`border-2 rounded-xl p-4 text-center transition-all hover:scale-105 cursor-pointer ${
                isUnlocked 
                  ? `${getAchievementColor(achievement.type)} shadow-sm` 
                  : 'bg-gray-50 border-gray-200 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Icon */}
              <div className="text-4xl mb-3">
                {isUnlocked ? (
                  achievement.icon || (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${tierStyle.bg}`}>
                      {tierStyle.icon}
                    </div>
                  )
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl text-gray-400">🔒</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className={`font-semibold mb-1 line-clamp-1 ${isUnlocked ? 'text-gray-900' : 'text-gray-600'}`}>
                {achievement.name}
              </h3>
              
              {/* Description */}
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {achievement.description}
              </p>
              
              {/* Type Badge */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tierStyle.bg} ${tierStyle.text} border ${tierStyle.border}`}>
                  {tierStyle.icon}
                  {getTypeDisplay(achievement.type)}
                </span>

                {isUnlocked ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircleIcon className="w-3 h-3" />
                    Unlocked
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">
                    {progressPercent}% done
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {hasProgress && !isUnlocked && target > 0 && (
                <div className="mt-2 w-full">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{current}/{target}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 rounded-full h-1.5 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Points */}
              {achievement.points > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  +{achievement.points} pts
                </div>
              )}
            </div>
          );
        })}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>No achievements yet. Start contributing to earn achievements!</p>
          <button
            onClick={() => router.push('/issues/new')}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Report an Issue
          </button>
        </div>
      )}
    </div>
  );
};

export default AchievementsSection;