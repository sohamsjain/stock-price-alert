import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User, LoginCredentials, RegisterCredentials } from '@/types';
import { authApi } from '@/lib/api/auth';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true });
          
          const response = await authApi.login(credentials);
          
          if (response.user && response.access_token && response.refresh_token) {
            // Store tokens in HTTP-only cookies (more secure)
            Cookies.set('access_token', response.access_token, { 
              expires: 1, // 1 day
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            });
            
            Cookies.set('refresh_token', response.refresh_token, { 
              expires: 7, // 7 days
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            });

            set({ 
              user: response.user, 
              isAuthenticated: true,
              isLoading: false 
            });
            return true;
          }
          
          return false;
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
          toast.error(errorMessage);
          return false;
        }
      },

      register: async (credentials: RegisterCredentials) => {
        try {
          set({ isLoading: true });
          
          const response = await authApi.register(credentials);
          
          if (response.user && response.access_token && response.refresh_token) {
            // Store tokens in HTTP-only cookies
            Cookies.set('access_token', response.access_token, { 
              expires: 1,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            });
            
            Cookies.set('refresh_token', response.refresh_token, { 
              expires: 7,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            });

            set({ 
              user: response.user, 
              isAuthenticated: true,
              isLoading: false 
            });

            return true;
          }
          
          return false;
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
          toast.error(errorMessage);
          return false;
        }
      },

      logout: () => {
        // Remove tokens from cookies
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });

        toast.success('Logged out successfully.');
      },

      refreshToken: async () => {
        try {
          const refreshToken = Cookies.get('refresh_token');
          
          if (!refreshToken) {
            get().logout();
            return false;
          }

          const response = await authApi.refreshToken();
          
          if (response.access_token && response.user) {
            // Update access token
            Cookies.set('access_token', response.access_token, { 
              expires: 1,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict'
            });

            set({ 
              user: response.user,
              isAuthenticated: true 
            });

            return true;
          }
          
          get().logout();
          return false;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      initializeAuth: async () => {
        try {
          const accessToken = Cookies.get('access_token');
          const refreshToken = Cookies.get('refresh_token');

          if (!accessToken && !refreshToken) {
            set({ isLoading: false });
            return;
          }

          if (accessToken) {
            // Try to get current user with existing token
            try {
              const user = await authApi.getCurrentUser();
              set({ 
                user, 
                isAuthenticated: true,
                isLoading: false 
              });
              return;
            } catch (error) {
              // Access token might be expired, try refresh
            }
          }

          if (refreshToken) {
            // Try to refresh token
            const refreshSuccess = await get().refreshToken();
            if (!refreshSuccess) {
              get().logout();
            }
          }

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          get().logout();
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);