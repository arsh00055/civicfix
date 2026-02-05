import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile, Achievement, UserActivity } from '@/types/user.types';

interface UserState {
  profile: UserProfile | null;
  achievements: Achievement[];
  activity: UserActivity[];
  stats: {
    issuesReported: number;
    issuesResolved: number;
    issuesAssigned: number;
    totalPoints: number;
    volunteerHours: number;
    ranking: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  achievements: [],
  activity: [],
  stats: {
    issuesReported: 0,
    issuesResolved: 0,
    issuesAssigned: 0,
    totalPoints: 0,
    volunteerHours: 0,
    ranking: 0,
  },
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    setAchievements: (state, action: PayloadAction<Achievement[]>) => {
      state.achievements = action.payload;
    },
    addAchievement: (state, action: PayloadAction<Achievement>) => {
      state.achievements = [...state.achievements, action.payload];
    },
    updateAchievement: (state, action: PayloadAction<Achievement>) => {
      state.achievements = state.achievements.map(achievement =>
        achievement.id === action.payload.id ? action.payload : achievement
      );
    },
    setActivity: (state, action: PayloadAction<UserActivity[]>) => {
      state.activity = action.payload;
    },
    addActivity: (state, action: PayloadAction<UserActivity>) => {
      state.activity = [action.payload, ...state.activity];
    },
    setStats: (state, action: PayloadAction<Partial<UserState['stats']>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    updateStats: (state, action: PayloadAction<Partial<UserState['stats']>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    incrementStat: (state, action: PayloadAction<keyof UserState['stats']>) => {
      const statKey = action.payload;
      if (typeof state.stats[statKey] === 'number') {
        state.stats[statKey] = (state.stats[statKey] as number) + 1;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearUserState: (state) => {
      state.profile = null;
      state.achievements = [];
      state.activity = [];
      state.stats = initialState.stats;
      state.error = null;
      state.isLoading = false;
    },
    updatePoints: (state, action: PayloadAction<number>) => {
      state.stats.totalPoints += action.payload;
      if (state.profile) {
        state.profile.points = (state.profile.points || 0) + action.payload;
      }
    },
    updateVolunteerHours: (state, action: PayloadAction<number>) => {
      state.stats.volunteerHours += action.payload;
      if (state.profile) {
        state.stats.volunteerHours = (state.stats.volunteerHours || 0) + action.payload;
      }
    },
  },
});

export const { 
  setProfile, 
  updateProfile,
  setAchievements,
  addAchievement,
  updateAchievement,
  setActivity,
  addActivity,
  setStats,
  updateStats,
  incrementStat,
  setLoading,
  setError,
  clearUserState,
  updatePoints,
  updateVolunteerHours
} = userSlice.actions;

export default userSlice.reducer;