import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { User, LoginCredentials, RegisterCredentials } from '@/types';

export const useAuth = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    initializeAuth,
    setUser,
    setLoading,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    // State
    user,
    isLoading,
    isAuthenticated,
    
    // Actions
    login: async (credentials: LoginCredentials) => {
      return await login(credentials);
    },
    
    register: async (credentials: RegisterCredentials) => {
      return await register(credentials);
    },
    
    logout: () => {
      logout();
    },
    
    refreshToken: async () => {
      return await refreshToken();
    },
    
    setUser: (user: User | null) => {
      setUser(user);
    },
    
    setLoading: (loading: boolean) => {
      setLoading(loading);
    },
  };
};