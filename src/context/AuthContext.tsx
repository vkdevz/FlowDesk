import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { apiClient } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('flowdesk_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const res = await apiClient.get<User>('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    const { token: jwtToken, id, name, roles } = res.data;
    localStorage.setItem('flowdesk_token', jwtToken);
    setToken(jwtToken);
    setUser({
      id,
      name,
      email,
      roles: roles as any,
      createdAt: new Date().toISOString(),
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await apiClient.post<AuthResponse>('/auth/register', { name, email, password });
    const { token: jwtToken, id, roles } = res.data;
    localStorage.setItem('flowdesk_token', jwtToken);
    setToken(jwtToken);
    setUser({
      id,
      name,
      email,
      roles: roles as any,
      createdAt: new Date().toISOString(),
    });
  };

  const logout = () => {
    localStorage.removeItem('flowdesk_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await apiClient.put<User>('/users/profile', data);
    setUser((prev) => (prev ? { ...prev, ...res.data } : res.data));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
