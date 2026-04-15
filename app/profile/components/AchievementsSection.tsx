'use client';

import React, { useState, useEffect, useRef, JSX } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrophyIcon,
  FireIcon,
  StarIcon,
  SparklesIcon,
  CheckCircleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import type { Achievement } from '@/types';
import { achievementsAPI } from '@/lib/services/api/endpoints';
import { useAuth } from '@/features/auth/hooks/useAuth';
import Loading from '@/app/loading';

const TIER_CONFIG: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    badge: string;
    icon: JSX.Element;
    progressColor: string;
    glow: string;
  }
> = {
  bronze: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: <FireIcon className="w-3.5 h-3.5" />,
    progressColor: 'bg-orange-400',
    glow: 'shadow-orange-100',
  },
  silver: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <StarIcon className="w-3.5 h-3.5" />,
    progressColor: 'bg-slate-400',
    glow: 'shadow-slate-100',
  },
  gold: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <TrophyIcon className="w-3.5 h-3.5" />,
    progressColor: 'bg-amber-400',
    glow: 'shadow-amber-100',
  },
  platinum: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: <SparklesIcon className="w-3.5 h-3.5" />,
    progressColor: 'bg-purple-500',
    glow: 'shadow-purple-100',
  },
};

const AchievementsSection: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (user && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      if (!user) return;
      const response = await achievementsAPI.getUserAchievements(user.id);
      const data = response.data;
      setAchievements(Array.isArray(data) ? data : data?.achievements || []);
    } catch {
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;
  const displayAchievements = achievements.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center">
            <TrophyIcon className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Achievements</h2>
            <p className="text-xs text-gray-400 font-medium">
              {unlockedCount} of {achievements.length} unlocked
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/profile/achievements')}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          View All →
        </button>
      </div>

      {/* Grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {displayAchievements.map((achievement) => {
          const hasProgress =
            achievement.progress && typeof achievement.progress === 'object';
          const current = hasProgress ? achievement.progress!.current : 0;
          const target = hasProgress ? achievement.progress!.target : 0;
          const isUnlocked = !!achievement.unlockedAt;
          const progressPercent = target > 0 ? Math.round((current / target) * 100) : 0;
          const tier = TIER_CONFIG[achievement.type] || TIER_CONFIG.bronze;

          return (
            <div
              key={achievement.id}
              onClick={() => router.push('/profile/achievements')}
              className={`relative rounded-xl p-4 text-center cursor-pointer transition-all duration-200 border group ${
                isUnlocked
                  ? `${tier.bg} ${tier.border} hover:shadow-md hover:-translate-y-0.5 ${tier.glow}`
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {/* Icon area */}
              <div className="flex justify-center mb-3">
                {isUnlocked ? (
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${tier.bg} border ${tier.border} shadow-sm`}
                  >
                    {achievement.icon || '🏆'}
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center">
                    <LockClosedIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Name */}
              <h3
                className={`text-sm font-bold mb-0.5 line-clamp-1 ${
                  isUnlocked ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {achievement.name}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-400 mb-2 line-clamp-2 leading-relaxed">
                {achievement.description}
              </p>

              {/* Status row */}
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold ${tier.badge}`}
                >
                  {tier.icon}
                  {achievement.type.charAt(0).toUpperCase() + achievement.type.slice(1)}
                </span>

                {isUnlocked ? (
                  <span className="flex items-center gap-0.5 text-green-600 font-bold">
                    <CheckCircleIcon className="w-3 h-3" />
                    Done
                  </span>
                ) : (
                  <span className="text-gray-400 font-medium">{progressPercent}%</span>
                )}
              </div>

              {/* Progress bar */}
              {hasProgress && !isUnlocked && target > 0 && (
                <div className="mt-2.5">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{current}/{target}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`${tier.progressColor} rounded-full h-1.5 transition-all`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Points */}
              {achievement.points > 0 && (
                <div
                  className={`mt-2 text-xs font-bold ${
                    isUnlocked ? tier.text : 'text-gray-400'
                  }`}
                >
                  +{achievement.points} pts
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {achievements.length === 0 && (
        <div className="text-center py-12 px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrophyIcon className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-sm font-bold text-gray-500 mb-1">No achievements yet</h3>
          <p className="text-xs text-gray-400 mb-4">
            Start contributing to earn badges and rewards!
          </p>
          <button
            onClick={() => router.push('/issues/new')}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Report an Issue
          </button>
        </div>
      )}
    </div>
  );
};

export default AchievementsSection;