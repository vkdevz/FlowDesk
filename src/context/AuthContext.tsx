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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('flowdesk_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('flowdesk_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await apiClient.get<User>('/auth/me');
        if (res.data) {
          setUser(res.data);
          setToken(storedToken);
        } else {
          localStorage.removeItem('flowdesk_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        localStorage.removeItem('flowdesk_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    const { token: jwtToken, id, name, roles } = res.data;
    localStorage.setItem('flowdesk_token', jwtToken);
    setToken(jwtToken);
    
    // Fetch full me profile or build user object
    setUser({
      id,
      name: name || email.split('@')[0],
      email: email,
      roles: (roles as any) || ['ROLE_USER'],
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
      roles: (roles as any) || ['ROLE_USER'],
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
    setUser((prev) => (prev ? { ...prev, ...res.data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
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
