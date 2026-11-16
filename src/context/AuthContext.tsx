import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, setAuthToken, clearAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { employeeId: string; name: string }) => Promise<User>;
  register: (payload: { fullName: string; role?: 'employee' | 'manager'; email?: string }) => Promise<{ user: User; employeeId: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isManager: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getAuthToken();
      if (storedToken) {
        try {
          const { user } = await api.getMe();
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.warn('Session expired or invalid token:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { employeeId: string; name: string }) => {
    setIsLoading(true);
    try {
      const response = await api.login(credentials);
      setUser(response.user);
      setToken(response.token);
      setAuthToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    fullName: string;
    role?: 'employee' | 'manager';
    email?: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await api.register(payload);
      const generatedId = response.employee?.employeeId || response.user?.employeeId;
      // If no admin was logged in, set user.
      // If admin is already logged in, KEEP admin logged in and do not overwrite admin session!
      if (!user) {
        setUser(response.user);
        setToken(response.token);
        setAuthToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return { user: response.user, employeeId: generatedId };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (user) {
      api.logout({ userId: user.id, employeeId: user.employeeId }).catch(() => {});
    } else {
      api.logout().catch(() => {});
    }
    setUser(null);
    setToken(null);
    clearAuthToken();
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isManager: user?.role === 'manager',
        isEmployee: user?.role === 'employee',
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
