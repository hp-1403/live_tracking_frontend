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

// Multi-Session Resolver with strict tab & role isolation:
// Allows Employee and Manager to be logged in simultaneously in the same browser!
const getInitialSession = (): { user: User | null; token: string | null } => {
  try {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';

    // 1. If opening /manager or /register in a tab:
    if (path.startsWith('/manager') || path.startsWith('/register')) {
      // Check tab-isolated manager session first
      const tabToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('token') : null;
      const tabUserStr = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('user') : null;
      if (tabToken && tabUserStr) {
        const u = JSON.parse(tabUserStr);
        if (u.role === 'manager') {
          return { token: tabToken, user: u };
        }
      }

      // Check saved manager session
      const mgrToken =
        sessionStorage.getItem('token_manager') || localStorage.getItem('token_manager');
      const mgrUser =
        sessionStorage.getItem('user_manager') || localStorage.getItem('user_manager');
      if (mgrToken && mgrUser) {
        const u = JSON.parse(mgrUser);
        if (u.role === 'manager') {
          return { token: mgrToken, user: u };
        }
      }

      // When opening manager portal, NEVER fallback to an employee session!
      return { user: null, token: null };
    }

    // 2. If opening /employee in a tab:
    if (path.startsWith('/employee')) {
      const tabToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('token') : null;
      const tabUserStr = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('user') : null;
      if (tabToken && tabUserStr) {
        const u = JSON.parse(tabUserStr);
        if (u.role === 'employee') {
          return { token: tabToken, user: u };
        }
      }

      const empToken =
        sessionStorage.getItem('token_employee') || localStorage.getItem('token_employee');
      const empUser =
        sessionStorage.getItem('user_employee') || localStorage.getItem('user_employee');
      if (empToken && empUser) {
        const u = JSON.parse(empUser);
        if (u.role === 'employee') {
          return { token: empToken, user: u };
        }
      }

      // When opening employee portal, NEVER fallback to a manager session!
      return { user: null, token: null };
    }

    // 3. If on /login or other routes with ?role= query:
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      if (roleParam === 'manager') {
        const mgrToken =
          sessionStorage.getItem('token_manager') || localStorage.getItem('token_manager');
        const mgrUser =
          sessionStorage.getItem('user_manager') || localStorage.getItem('user_manager');
        if (mgrToken && mgrUser) {
          return { token: mgrToken, user: JSON.parse(mgrUser) };
        }
        return { user: null, token: null };
      } else if (roleParam === 'employee') {
        const empToken =
          sessionStorage.getItem('token_employee') || localStorage.getItem('token_employee');
        const empUser =
          sessionStorage.getItem('user_employee') || localStorage.getItem('user_employee');
        if (empToken && empUser) {
          return { token: empToken, user: JSON.parse(empUser) };
        }
        return { user: null, token: null };
      }
    }

    // 4. Tab-isolated session (persists across refresh in the current tab)
    const tabToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('token') : null;
    const tabUserStr = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('user') : null;
    if (tabToken && tabUserStr) {
      return { token: tabToken, user: JSON.parse(tabUserStr) };
    }
  } catch {}

  // A fresh tab opens clean on /login without borrowing other tabs' sessions
  return { user: null, token: null };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialSession] = useState(getInitialSession);
  const [user, setUser] = useState<User | null>(initialSession.user);
  const [token, setToken] = useState<string | null>(initialSession.token);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const activeToken = getAuthToken();
      if (activeToken) {
        try {
          const { user: fetchedUser } = await api.getMe();
          setUser(fetchedUser);
          sessionStorage.setItem('user', JSON.stringify(fetchedUser));
          if (fetchedUser.role === 'manager') {
            sessionStorage.setItem('user_manager', JSON.stringify(fetchedUser));
            localStorage.setItem('user_manager', JSON.stringify(fetchedUser));
          } else {
            sessionStorage.setItem('user_employee', JSON.stringify(fetchedUser));
            localStorage.setItem('user_employee', JSON.stringify(fetchedUser));
          }
        } catch (error) {
          console.warn('Session check failed or expired token:', error);
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
      const loggedUser = response.user;
      const loggedToken = response.token;

      setUser(loggedUser);
      setToken(loggedToken);

      // Save tab-isolated session
      sessionStorage.setItem('token', loggedToken);
      sessionStorage.setItem('user', JSON.stringify(loggedUser));

      // Save role-specific session so new tabs opening /manager or /employee resolve properly
      setAuthToken(loggedToken, loggedUser.role);
      if (loggedUser.role === 'manager') {
        sessionStorage.setItem('user_manager', JSON.stringify(loggedUser));
        localStorage.setItem('user_manager', JSON.stringify(loggedUser));
      } else {
        sessionStorage.setItem('user_employee', JSON.stringify(loggedUser));
        localStorage.setItem('user_employee', JSON.stringify(loggedUser));
      }

      return loggedUser;
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
      // If no admin was logged in on this tab, set user.
      // If admin is already logged in, KEEP admin logged in and do not overwrite admin session!
      if (!user) {
        setUser(response.user);
        setToken(response.token);
        setAuthToken(response.token, response.user.role);
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('user', JSON.stringify(response.user));
      }
      return { user: response.user, employeeId: generatedId };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    const userRole = user?.role;
    if (user) {
      api.logout({ userId: user.id, employeeId: user.employeeId }).catch(() => { });
    } else {
      api.logout().catch(() => { });
    }

    setUser(null);
    setToken(null);
    clearAuthToken(userRole);
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
