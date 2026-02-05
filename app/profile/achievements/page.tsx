'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { achievementsAPI } from '@/lib/services/api/endpoints';
import { useAuth } from '@/features/auth/hooks/useAuth';
import Loading from '@/app/loading'
import Error from '@/app/error'
import type { Achievement as AchievementType } from '@/types';
import AchievementsHeader from './components/AchievementsHeader';
import AchievementsStats from './components/AchievementsStats';
import AchievementsTabs from './components/AchievementsTabs';
import AchievementsGrid from './components/AchievementsGrid';

type AchievementTab = 'all' | 'unlocked' | 'locked';

const AchievementsPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [achievements, setAchievements] = useState<AchievementType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AchievementTab>('all');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAchievements();
    }
  }, [user, isAuthenticated]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || !isAuthenticated) {
        setError('Please log in to view your achievements');
        return;
      }

      const response = await achievementsAPI.getUserAchievements(user.id);
      setAchievements(response.data || []);
      
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
      setError('Failed to load achievements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchAchievements();
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleReportIssue = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push('/issues/new');
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === 'unlocked') return !!achievement.unlockedAt;
    if (activeTab === 'locked') return !achievement.unlockedAt;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const lockedCount = achievements.length - unlockedCount;

  // Show loading or redirect if user is not authenticated
  if (!isAuthenticated || !user) {
    return (
      <MainLayout role={null}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
              <p className="text-gray-600 mb-6">
                You need to be logged in to view your achievements.
              </p>
              <button
                onClick={handleLogin}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Log In to Continue
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role={user?.role}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <AchievementsHeader onRefresh={handleRetry} />

          {/* Error Banner */}
          {error && (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />)}

          {/* Loading State */}
          {loading && (<Loading />)}

          {/* Content */}
          {!loading && (
            <>
              {/* Stats */}
              <AchievementsStats achievements={achievements} />

              {/* Tabs */}
              <AchievementsTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                totalCount={achievements.length}
                unlockedCount={unlockedCount}
                lockedCount={lockedCount}
              />

              {/* Achievements Grid */}
              <AchievementsGrid
                achievements={filteredAchievements}
                activeTab={activeTab}
                onReportIssue={handleReportIssue}
              />
            </>
          )}

          {/* Back to Profile */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/profile')}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← Back to Profile
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AchievementsPage;