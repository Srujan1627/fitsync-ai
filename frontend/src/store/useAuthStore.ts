import { create } from 'zustand';
import api, { setAuthToken } from '../services/api';
import { secureStore } from '../services/secureStore';

interface AuthState {
  user: any;
  token: string | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  initAuth: () => Promise<void>;
  login: (data: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitializing: true,
  error: null,

  initAuth: async () => {
    try {
      const token = await secureStore.getToken();
      const user = await secureStore.getUser();
      if (token && user) {
        setAuthToken(token);
        set({ token, user, isInitializing: false });
      } else {
        set({ isInitializing: false });
      }
    } catch (e) {
      console.error('Failed to initialize auth state:', e);
      set({ isInitializing: false });
    }
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', data);
      const { token, ...user } = response.data;
      
      // Save securely
      await secureStore.saveToken(token);
      await secureStore.saveUser(user);
      
      setAuthToken(token);
      set({ user, token, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
    }
  },

  signup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/signup', data);
      const { token, ...user } = response.data;
      
      // Save securely
      await secureStore.saveToken(token);
      await secureStore.saveUser(user);
      
      setAuthToken(token);
      set({ user, token, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Signup failed', isLoading: false });
    }
  },

  logout: async () => {
    // Clear securely
    await secureStore.clearAll();
    setAuthToken(null);
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

