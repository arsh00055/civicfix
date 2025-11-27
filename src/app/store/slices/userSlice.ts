import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  profile: any | null;
  achievements: any[];
  activity: any[];
}

const initialState: UserState = {
  profile: null,
  achievements: [],
  activity: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<any>) => {
      state.profile = action.payload;
    },
    setAchievements: (state, action: PayloadAction<any[]>) => {
      state.achievements = action.payload;
    },
    setActivity: (state, action: PayloadAction<any[]>) => {
      state.activity = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<any>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
});

export const { setProfile, setAchievements, setActivity, updateProfile } = userSlice.actions;
export default userSlice.reducer;