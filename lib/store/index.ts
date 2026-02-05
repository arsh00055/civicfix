import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import issuesReducer from './slices/issuesSlice';
import userReducer from './slices/userSlice';

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      issues: issuesReducer,
      user: userReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: ['persist/PERSIST'],
          // Ignore these field paths in all actions
          ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt'],
          // Ignore these paths in the state
          ignoredPaths: ['ui.notifications', 'issues.issues'],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });

  // Optional: Add RTK Query listeners
  setupListeners(store.dispatch);

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];