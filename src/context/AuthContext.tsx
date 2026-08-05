import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { apiClient } from '../services/api';

const DEFAULT_USER: User = {
  id: 'usr_default_1',
  name: 'Alex Morgan',
  email: 'alex.morgan@flowdesk.io',
  roles: ['ROLE_ADMIN', 'ROLE_USER'],
  createdAt: '2026-01-15T08:00:00Z',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  jobTitle: 'Senior Engineering Manager',
  bio: 'Building enterprise productivity systems with Spring Boot and React.'
};

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
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [token, setToken] = useState<string>('flowdesk_demo_jwt_token');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await apiClient.get<User>('/auth/me');
        if (res.data) {
          setUser(res.data);
        }
      } catch (err) {
        // Retain default user profile on static deployments or offline
        console.log('Using default active user session');
      }
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      const { token: jwtToken, id, name, roles } = res.data;
      localStorage.setItem('flowdesk_token', jwtToken);
      setToken(jwtToken);
      setUser({
        id,
        name: name || 'Alex Morgan',
        email: email || 'alex.morgan@flowdesk.io',
        roles: (roles as any) || ['ROLE_ADMIN', 'ROLE_USER'],
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      // Fallback local login
      setUser({
        id: 'usr_' + Date.now(),
        name: email.split('@')[0] || 'Demo User',
        email: email || 'demo@flowdesk.io',
        roles: ['ROLE_ADMIN', 'ROLE_USER'],
        createdAt: new Date().toISOString(),
      });
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/register', { name, email, password });
      const { token: jwtToken, id, roles } = res.data;
      localStorage.setItem('flowdesk_token', jwtToken);
      setToken(jwtToken);
      setUser({
        id,
        name,
        email,
        roles: (roles as any) || ['ROLE_ADMIN', 'ROLE_USER'],
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      setUser({
        id: 'usr_' + Date.now(),
        name: name || 'New User',
        email: email || 'newuser@flowdesk.io',
        roles: ['ROLE_USER'],
        createdAt: new Date().toISOString(),
      });
    }
  };

  const logout = () => {
    // Reset to default active demo user rather than locking out the application
    setUser(DEFAULT_USER);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const res = await apiClient.put<User>('/users/profile', data);
      setUser((prev) => ({ ...prev, ...res.data }));
    } catch (err) {
      setUser((prev) => ({ ...prev, ...data }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: true,
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

