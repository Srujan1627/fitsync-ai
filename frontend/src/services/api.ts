import axios from 'axios';
import { Platform } from 'react-native';
import { secureStore } from './secureStore';

// For Android emulator, localhost is 10.0.2.2. For iOS emulator, it's localhost.
const isProduction = process.env.NODE_ENV === 'production';
const BASE_URL = isProduction && process.env.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL
  : Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Inject Authorization JWT dynamically from SecureStore if it exists
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await secureStore.getToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Failed to inject secure token:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format errors globally & handle unauthorized status
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if network error or timeout
    if (!error.response) {
      console.error('Network Error / Server is offline');
      return Promise.reject(new Error('Connection to FitSync server failed. Check your network or make sure the backend server is running.'));
    }

    const { status, data } = error.response;

    // Handle token expiration/unauthorized
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('Session expired or token invalid. Cleaning credentials...');
      // Clear secure store and logout
      await secureStore.clearAll();
      // We can also let the calling component/store handle the state update
    }

    // Enhance standard axios error messages
    const formattedError = {
      status,
      message: data?.message || 'Something went wrong. Please try again.',
      rawError: error
    };

    return Promise.reject(formattedError);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
