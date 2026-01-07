// lib/services/api/client.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'https://ideal-goggles-69944rg4xrjgcx6pw-3001.app.github.dev/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    
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

// Response interceptor with better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('🟢 API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('🔴 API Error:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      fullUrl: error.config?.baseURL + error.config?.url
    });
    
    // Network error - server not reachable
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to API server. Please check:');
      console.error('1. Is Mockoon running on port 3002?');
      console.error('2. Test in browser');
    }
    
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
      Cookies.remove('user_role');
      Cookies.remove('user_data');
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;