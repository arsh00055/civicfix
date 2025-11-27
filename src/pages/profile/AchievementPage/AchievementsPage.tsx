import React, { useState, useEffect, Suspense } from 'react';
import { achievementsAPI } from '../../../services/api/endpoints';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import Sidebar from '../../../components/layout/sidebar/Sidebar';
import Header from '../../../components/layout/Header/Header';
import { useAppSelector } from '../../../app/store/hooks';
import type { Achievement as AchievementType } from '../../../types';

// Lazy-loaded components
import {
  AchievementsHeader,
  ErrorBanner,
  AchievementsStats,
  AchievementsTabs,
  AchievementsGrid,
  AuthRequired,
  LoadingState,
  ErrorState
} from './components/lazy';

interface AchievementProps {
  role: string | null;
}

type AchievementTab = 'all' | 'unlocked' | 'locked';

const AchievementsPage: React.FC<AchievementProps> = ({ role }) => {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const [achievements, setAchievements] = useState<AchievementType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AchievementTab>('all');
  const { user, isAuthenticated } = useAuth();

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
      setAchievements(response.data);
      
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
    window.location.href = '/login';
  };

  const handleReportIssue = () => {
    window.location.href = '/report-issue';
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
      <div className="flex h-screen bg-gray-50">
        {sidebarOpen && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={role} />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <AuthRequired onLogin={handleLogin} />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !achievements.length) {
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarOpen && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={role} />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <LoadingState />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  // Error state (when no data exists)
  if (error && !achievements.length) {
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarOpen && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={role} />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <ErrorState error={error} onRetry={handleRetry} />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole={role} />
        <main className="flex-1 overflow-auto p-6">
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <Suspense fallback={<div>Loading header...</div>}>
                <AchievementsHeader onRefresh={handleRetry} />
              </Suspense>

              {/* Error Banner */}
              <Suspense fallback={<div>Loading error banner...</div>}>
                <ErrorBanner error={error} onRetry={handleRetry} />
              </Suspense>

              {/* Stats */}
              <Suspense fallback={<div>Loading stats...</div>}>
                <AchievementsStats achievements={achievements} />
              </Suspense>

              {/* Tabs */}
              <Suspense fallback={<div>Loading tabs...</div>}>
                <AchievementsTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  totalCount={achievements.length}
                  unlockedCount={unlockedCount}
                  lockedCount={lockedCount}
                />
              </Suspense>

              {/* Achievements Grid */}
              <Suspense fallback={<div>Loading achievements...</div>}>
                <AchievementsGrid
                  achievements={filteredAchievements}
                  activeTab={activeTab}
                  onReportIssue={handleReportIssue}
                />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AchievementsPage;