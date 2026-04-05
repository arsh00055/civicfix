import axios from 'axios';
import Cookies from 'js-cookie';

// Make sure this does NOT have a trailing slash and does NOT include /api
// e.g. "http://localhost:3000" or "https://yourapp.vercel.app"
const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api$/, '');
const API_BASE_URL = `${baseUrl}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor: attach auth token ───────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token =
      Cookies.get('auth_token') ||
      (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// ─── Response interceptor: handle 401 & surface errors clearly ───────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth tokens
      Cookies.remove('auth_token');
      Cookies.remove('user_role');
      Cookies.remove('user_data');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }

    // Surface a useful error message from the API if available
    const serverMessage = error.response?.data?.message || error.response?.data?.error;
    if (serverMessage) {
      error.message = serverMessage;
    }

    console.error(
      `API error [${error.response?.status ?? 'network'}]:`,
      error.message
    );
    return Promise.reject(error);
  }
);

export default apiClient;