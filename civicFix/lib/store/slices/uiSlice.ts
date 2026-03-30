import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '@/types/notification.types';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Notification[];
  modal: {
    isOpen: boolean;
    type: string;
    data: any;
  };
  toast: {
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };
  loading: boolean;
}

const initialState: UIState = {
  sidebarOpen: false,
  theme: 'light',
  notifications: [],
  modal: {
    isOpen: false,
    type: '',
    data: null,
  },
  toast: {
    isOpen: false,
    message: '',
    type: 'info',
  },
  loading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openSidebar: (state) => {
      state.sidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.sidebarOpen = false;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications = [action.payload, ...state.notifications];
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.map(notification =>
        notification.id === action.payload ? { ...notification, read: true } : notification
      );
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications = state.notifications.map(notification => ({
        ...notification,
        read: true
      }));
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: '',
        data: null,
      };
    },
    showToast: (state, action: PayloadAction<{ message: string; type?: UIState['toast']['type'] }>) => {
      state.toast = {
        isOpen: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
      };
    },
    hideToast: (state) => {
      state.toast.isOpen = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearAllUI: (state) => {
      state.notifications = [];
      state.modal = initialState.modal;
      state.toast = initialState.toast;
      state.loading = false;
    },
  },
});

export const { 
  toggleSidebar,
  openSidebar,
  closeSidebar,
  setTheme,
  toggleTheme,
  addNotification,
  removeNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  openModal,
  closeModal,
  showToast,
  hideToast,
  setLoading,
  clearAllUI
} = uiSlice.actions;

export default uiSlice.reducer;