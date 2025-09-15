import axiosInstance from '@/lib/axios';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';
import Cookies from 'js-cookie';

export const authApi = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (): Promise<{ access_token: string; user: User }> => {
    const refreshToken = Cookies.get('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axiosInstance.post('/auth/refresh', {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<{ user: User }>('/auth/me');
    return response.data.user;
  },

  /**
   * Google OAuth login (for future implementation)
   */
  googleLogin: async (token: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/google', { token });
    return response.data;
  },

  /**
   * Logout user (server-side logout if needed)
   */
  logout: async (): Promise<void> => {
    // For now, we'll just handle client-side logout
    // If your backend has a logout endpoint, call it here
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors - we'll clear local state anyway
      console.warn('Logout API call failed:', error);
    }
  },
};