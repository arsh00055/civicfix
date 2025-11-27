import { useState, useEffect } from 'react';
import type { UserProfile, UserActivity, Achievement } from '../../../types';
import { usersAPI, achievementsAPI, activityAPI } from '../../../services/api/endpoints';

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile data
      const profileResponse = await usersAPI.getProfile();
      setProfile(profileResponse.data);

      // Fetch user activities
      try {
        const activitiesResponse = await activityAPI.getRecentActivity(20);
        setActivities(activitiesResponse.data);
      } catch (activityError) {
        console.error('Failed to fetch activities:', activityError);
        setActivities([]);
      }

      // Fetch user achievements
      try {
        const achievementsResponse = await achievementsAPI.getUserAchievements(
          userId || profileResponse.data.id
        );
        setAchievements(achievementsResponse.data);
      } catch (achievementError) {
        console.error('Failed to fetch achievements:', achievementError);
        setAchievements([]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile data');
      console.error('Profile data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      const response = await usersAPI.updateProfile(updates);
      const updatedProfile = response.data;
      
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : updatedProfile);
      return true;
    } catch (err) {
      console.error('Profile update failed:', err);
      throw err;
    }
  };

  const updatePreferences = async (preferenceType: keyof UserProfile['preferences'], updates: any): Promise<boolean> => {
    try {
      // Update specific preference section
      const currentPreferences = profile?.preferences;
      if (!currentPreferences) {
        throw new Error('No preferences found');
      }

      const updatedPreferences = {
        ...currentPreferences,
        [preferenceType]: {
          ...currentPreferences[preferenceType],
          ...updates
        }
      };

      const response = await usersAPI.updateProfile({ 
        preferences: updatedPreferences 
      });
      
      setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          preferences: updatedPreferences
        };
      });
      
      return true;
    } catch (err) {
      console.error('Preferences update failed:', err);
      throw err;
    }
  };

  const addSkill = async (skill: string): Promise<boolean> => {
    if (!profile || profile.role !== 'volunteer') {
      throw new Error('Only volunteers can add skills');
    }

    try {
      const currentSkills = profile.skills || [];
      const newSkills = [...currentSkills, skill];
      
      const response = await usersAPI.updateProfile({ skills: newSkills });
      setProfile(prev => prev ? { ...prev, skills: newSkills } : prev);
      return true;
    } catch (err) {
      console.error('Add skill failed:', err);
      throw err;
    }
  };

  const removeSkill = async (skill: string): Promise<boolean> => {
    if (!profile || !profile.skills) {
      throw new Error('No skills to remove');
    }

    try {
      const newSkills = profile.skills.filter(s => s !== skill);
      const response = await usersAPI.updateProfile({ skills: newSkills });
      setProfile(prev => prev ? { ...prev, skills: newSkills } : prev);
      return true;
    } catch (err) {
      console.error('Remove skill failed:', err);
      throw err;
    }
  };

  const getUserActivity = async (targetUserId?: string): Promise<UserActivity[]> => {
    try {
      const activityUserId = targetUserId || userId || profile?.id;
      if (!activityUserId) {
        throw new Error('User ID required to fetch activity');
      }

      const response = await activityAPI.getUserActivity(activityUserId);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch user activity:', err);
      throw err;
    }
  };

  const getUserAchievements = async (targetUserId?: string): Promise<Achievement[]> => {
    try {
      const achievementUserId = targetUserId || userId || profile?.id;
      if (!achievementUserId) {
        throw new Error('User ID required to fetch achievements');
      }

      const response = await achievementsAPI.getUserAchievements(achievementUserId);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch user achievements:', err);
      throw err;
    }
  };

  const unlockAchievement = async (achievementId: string): Promise<boolean> => {
    try {
      const response = await achievementsAPI.unlockAchievement(achievementId);
      const unlockedAchievement = response.data;
      
      // Update local achievements state
      setAchievements(prev => {
        const exists = prev.find(a => a.id === achievementId);
        if (exists) return prev; // Already unlocked
        
        return [...prev, unlockedAchievement];
      });
      
      return true;
    } catch (err) {
      console.error('Failed to unlock achievement:', err);
      throw err;
    }
  };

  const searchUsers = async (query: string) => {
    try {
      const response = await usersAPI.searchUsers(query);
      return response.data;
    } catch (err) {
      console.error('Failed to search users:', err);
      throw err;
    }
  };

  const getUserStats = async (targetUserId?: string) => {
    try {
      const statsUserId = targetUserId || userId || profile?.id;
      if (!statsUserId) {
        throw new Error('User ID required to fetch stats');
      }

      // This would use your analyticsAPI or usersAPI
      const response = await usersAPI.getUserActivity(statsUserId);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
      throw err;
    }
  };

  return {
    profile,
    activities,
    achievements,
    loading,
    error,
    refetch: fetchProfileData,
    updateProfile,
    updatePreferences,
    addSkill,
    removeSkill,
    getUserActivity,
    getUserAchievements,
    unlockAchievement,
    searchUsers,
    getUserStats,
  };
};