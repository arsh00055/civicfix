'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProfileHeader from './components/ProfileHeader';
import ProfileSidebar from './components/ProfileSidebar';
import Loading from '@/app/loading'
import Error from '@/app/error'
import AchievementsSection from './components/AchievementsSection';
import { useAuth } from '@/features/auth/hooks/useAuth';
import apiClient from '@/lib/services/api/client';

interface UserStats {
  communityScore: number;
  issuesReported: number;
  issuesResolved: number;
  achievements: number;
}

const ProfilePage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats>({
    communityScore: 0,
    issuesReported: 0,
    issuesResolved: 0,
    achievements: 0
  });
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Fetch user profile
      const userResponse = await apiClient.get('/api/users/profile');
      const userData = userResponse.data || userResponse;
      setUser(userData.user || userData);

      // Fetch user by ID for stats
      try {
        const userDetailResponse = await apiClient.get(`/api/users/${currentUser.id}`);
        const userDetail = userDetailResponse.data || userDetailResponse;
        if (userDetail.user?.stats) {
          setStats({
            issuesReported: userDetail.user.stats.issuesReported || 0,
            issuesResolved: userDetail.user.stats.issuesResolved || 0,
            achievements: userDetail.user.stats.achievements || 0,
            communityScore: userDetail.user.stats.communityScore || 0
          });
        }
      } catch (err) {
        console.warn('Could not fetch user details, using default stats');
      }

      // Fetch achievements
      try {
        const achievementsResponse = await apiClient.get('/api/achievements/user');
        const achievementsData = achievementsResponse.data || achievementsResponse;
        setAchievements(achievementsData.achievements || achievementsData || []);
      } catch (err) {
        console.warn('Could not fetch achievements');
      }

    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchUserData();
  };

  if (loading) {
    return (<Loading />);
  }

  if (error || !user) {
    return (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />);
  }

  return (
    <MainLayout role={user?.role}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <ProfileHeader user={user} stats={{ 
            issuesReported: stats.issuesReported, 
            issuesResolved: stats.issuesResolved, 
            communityScore: stats.communityScore ?? 0 
          }} />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSidebar user={user} />
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Achievements Section */}
              <AchievementsSection />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;