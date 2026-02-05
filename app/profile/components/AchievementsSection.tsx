'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Achievement3D from '@/components/three/Achievement3D';
import type { Achievement } from '@/types';
import { achievementsAPI } from '@/lib/services/api/endpoints';
import { useAuth } from '@/features/auth/hooks/useAuth';
import Loading from '@/app/loading';
import Error from '@/app/error'

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayAchievements.map(achievement => {
          const hasProgress = achievement.progress && typeof achievement.progress === 'object';
          const current = hasProgress ? achievement.progress!.current : 0;
          const target = hasProgress ? achievement.progress!.target : 0;
          const isUnlocked = !!achievement.unlockedAt;
          
          return (
            <div
              key={achievement.id}
              onClick={() => handleAchievementClick(achievement)}
              className={`border-2 rounded-xl p-4 text-center transition-transform hover:scale-105 cursor-pointer ${
                isUnlocked 
                  ? getAchievementColor(achievement.type) 
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              {/* 3D Achievement Display */}
              <div className="flex justify-center mb-3">
                {isUnlocked ? (
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

              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{achievement.name}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{achievement.description}</p>
              
              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-1 rounded-full ${
                  isUnlocked 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {getTypeDisplay(achievement.type)}
                </span>

                {isUnlocked ? (
                  <span className="text-green-600 font-medium">Unlocked</span>
                ) : hasProgress ? (
                  <span className="text-blue-600">
                    {current}/{target}
                  </span>
                ) : (
                  <span className="text-gray-500">Locked</span>
                )}
              </div>

              {/* Progress Bar */}
              {hasProgress && !isUnlocked && target > 0 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(current / target) * 100}%` 
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-8 text-gray-500">
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