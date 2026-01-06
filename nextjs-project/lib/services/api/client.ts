import axios from 'axios';
import Cookies from 'js-cookie';

// Use a shorter timeout for development
const API_BASE_URL = 'http://localhost:3002';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Reduced to 3 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Use Cookies instead of localStorage for Next.js
    const token = Cookies.get('auth_token');
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

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error.message);
    
    if (error.response?.status === 401) {
      // Clear cookies
      Cookies.remove('auth_token');
      Cookies.remove('user_role');
      Cookies.remove('user_data');
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;