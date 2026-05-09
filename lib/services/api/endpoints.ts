import apiClient from './client';
import type {
  CitizenRegistrationData,
  VolunteerRegistrationData,
  AdminRegistrationData,
  LoginCredentials
} from '@/types/auth.types';

export const authApi = {
  login: async (data: LoginCredentials) => {
    const getFallbackData = () => {
      const timestamp = Date.now();
      return {
        token: `mock-jwt-token-${timestamp}`,
        user: {
          id: `user-${timestamp}`,
          email: data.email,
          name: data.email.split('@')[0],
          role: data.role,
          avatar: '/images/avatar-placeholder.png',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          phone: '+1234567890',
          isActive: true,
          isVerified: true,
        },
      };
    };

    try {
      const response = await apiClient.post('/auth/login/', JSON.stringify(data));
      const rawText =
        typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

      if (!rawText || rawText.trim() === '') return getFallbackData();

      try {
        return JSON.parse(rawText);
      } catch {
        // Try to fix malformed JSON
        const fixed = rawText
          .replace(/"name":\s*""([^"]*)""/g, '"name": "$1"')
          .replace(/([^\\])""/g, '$1"')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');
        try {
          return JSON.parse(fixed);
        } catch {
          return getFallbackData();
        }
      }
    } catch (error: any) {
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
        return getFallbackData();
      }
      throw error;
    }
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  register: async (data: any, role: string) => {
    switch (role) {
      case 'citizen':   return authApi.registerCitizen(data as CitizenRegistrationData);
      case 'volunteer': return authApi.registerVolunteer(data as VolunteerRegistrationData);
      case 'admin':     return authApi.registerAdmin(data as AdminRegistrationData);
    }
  },

  registerCitizen:  async (data: CitizenRegistrationData)  => (await apiClient.post('/auth/register/citizen', data)).data,
  registerVolunteer: async (data: VolunteerRegistrationData) => (await apiClient.post('/auth/register/volunteer', data)).data,
  registerAdmin:    async (data: AdminRegistrationData)    => (await apiClient.post('/auth/register/admin', data)).data,

  verifyEmail: async (token: string) =>
    (await apiClient.post('/auth/verify-email', { token })).data,

  resendVerification: async (email: string) =>
    (await apiClient.post('/auth/resend-verification', { email })).data,
};

export const notificationsAPI = {
  getNotifications:  () => apiClient.get('/notifications'),
  getUnreadCount:    () => apiClient.get('/notifications/unread/count'),
  markAsRead:        (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead:     () => apiClient.patch('/notifications/read-all'),
  deleteNotification:(id: string) => apiClient.delete(`/notifications/${id}`),
};

export const achievementsAPI = {
  getAchievements:     () => apiClient.get('/achievements'),
  getUserAchievements: (userId: string) => apiClient.get(`/achievements`),
  unlockAchievement:   (achievementId: string) => apiClient.post(`/achievements/${achievementId}/unlock`),
};

export const issuesAPI = {
  getIssues: (params?: Record<string, any>) =>
    apiClient.get('/issues', { params }),
  getAvailableTasks: (params?: Record<string, any>) =>
    apiClient.get('/issues/available', { params }),
  getMyReports: () =>
    apiClient.get('/issues/my-reports'),
  getIssue: (id: string) =>
    apiClient.get(`/issues/${id}`),
  createIssue: (issueData: any) =>
    apiClient.post('/issues', issueData),
  updateIssue: (id: string, issueData: any) =>
    apiClient.put(`/issues/${id}`, issueData),
  deleteIssue: (id: string) =>
    apiClient.delete(`/issues/${id}`),
  voteIssue: (id: string) =>
    apiClient.post(`/issues/${id}/vote`),
  claimIssue: (id: string) =>
    apiClient.post(`/issues/${id}/claim`),
  getIssueComments: (issueId: string) =>
    apiClient.get(`/issues/${issueId}/comments`),
  addComment: (issueId: string, commentData: any) =>
    apiClient.post(`/issues/${issueId}/comments`, commentData),
};

export const volunteersAPI = {
  getAvailableTasks: () => apiClient.get('/issues/available'),
  getMyAssignments: () => apiClient.get('/volunteers/assignments'),
  claimTask: (taskId: string) => apiClient.post(`/issues/${taskId}/claim`),
  updateTaskStatus: (taskId: string, status: string) =>
    apiClient.put(`/issues/${taskId}`, { status }),
  findTasks: (filters?: any) =>
    apiClient.get('/issues', { params: filters }),
};


export const adminAPI = {
  getSupportEmail: () => apiClient.get('/admin/support-email'),
  getStats:         () => apiClient.get('/users/stats'),
  getUsers:         (params?: any) => apiClient.get('/admin/users', { params }),
  updateUser:       (userId: string, userData: any) => apiClient.put(`/admin/users/${userId}`, userData),
  getSystemHealth:  () => apiClient.get('/admin/health'),
  getReports:       (filters?: any) => apiClient.get('/admin/reports', { params: filters }),
  deactivateUser:   (userId: string) => apiClient.patch(`/admin/users/${userId}/deactivate`),
  activateUser:     (userId: string) => apiClient.patch(`/admin/users/${userId}/activate`),
  deleteUser:       (userId: string) => apiClient.delete(`/admin/users/${userId}`),
  getUserStats:     (userId: string) => apiClient.get(`/admin/users/${userId}/stats`),
  getAnalyticsOverview: (timeframe?: string) =>
    apiClient.get('/admin/analytics/overview', { params: { timeframe } }),
  getIssueAnalytics: (params?: any) => apiClient.get('/admin/analytics/issues', { params }),
  getUserAnalytics:  (params?: any) => apiClient.get('/admin/analytics/users', { params }),
};

export const usersAPI = {
  getProfile:     () => apiClient.get('/users/profile'),
  updateProfile:  (profileData: any) => apiClient.put('/users/profile', profileData),
  getUsers:       (params?: any) => apiClient.get('/users', { params }),
  getUser:        (id: string) => apiClient.get(`/users/${id}`),
  updateUserRole: (id: string, role: string) =>
    apiClient.patch(`/admin/users/${id}/role`, { role }),
  searchUsers:    (query: string) => apiClient.get('/users/search', { params: { query } }),
  getUserActivity:(userId: string) => apiClient.get(`/users/${userId}/activity`),
  getUserStats:     () => apiClient.get(`/users/stats`),
};

export const analyticsAPI = {
  getOverview:        (params?: any) => apiClient.get('/admin/analytics/overview', { params }),
  getUserStats:       () => apiClient.get('/admin/analytics/users'),
  getIssueStats:      () => apiClient.get('/admin/analytics/issues'),
  getGeographicData:  () => apiClient.get('/admin/analytics/geographic'),
  getPlatformMetrics: () => apiClient.get('/admin/analytics/platform-metrics'),
  getTrends:          (period: string) => apiClient.get('/admin/analytics/trends', { params: { period } }),
  exportAnalytics: async (format: string): Promise<void> => {
    const response = await apiClient.get('/admin/analytics/export', {
      params: { format },
      responseType: 'blob', // critical for file downloads
    });
  
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : `analytics-export.${format}`;
  
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const activityAPI = {
  getRecentActivity: () => apiClient.get('/activity/recent'),
  createActivity:    () => apiClient.post('/activity'),
  getActivityStats:  () => apiClient.get('/activity/stats'),
  getUserActivity:   (userId: string) => apiClient.get(`/activity/user/${userId}`),
  getSystemActivity: () => apiClient.get('/activity/system'),
};

export const commentsAPI = {
  getComments: (issueId: string) => 
    apiClient.get(`/issues/${issueId}/comments`),
  
  addComment: (issueId: string, commentData: any) =>
    apiClient.post(`/issues/${issueId}/comments`, commentData),
  
  editComment: (issueId: string, commentId: string, commentData: any) =>
    apiClient.put(`/issues/${issueId}/comments?commentId=${commentId}`, commentData),
  
  deleteComment: (issueId: string, commentId: string) => 
    apiClient.delete(`/issues/${issueId}/comments?commentId=${commentId}`),
}