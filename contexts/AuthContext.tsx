import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { apiClient } from '../services/apiClient';
import { authService } from '../services/authService';
import {
    clearTokens,
    hasTokens,
    saveTokens,
} from '../services/tokenManager';
import { UserRole } from '../types/api';

// ============================================================
// Types
// ============================================================

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  checkAuth(): Promise<void>;
}

// ============================================================
// Context
// ============================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// Provider
// ============================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  // ----------------------------------------------------------
  // Logout helper (also used by onUnauthorized callback)
  // ----------------------------------------------------------
  const performLogout = useCallback(async () => {
    setUser(null);
    await clearTokens();
  }, []);

  // ----------------------------------------------------------
  // Login
  // ----------------------------------------------------------
  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.signIn(email, password);
    await saveTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
  }, []);

  // ----------------------------------------------------------
  // Logout
  // ----------------------------------------------------------
  const logout = useCallback(async () => {
    try {
      await authService.signOut();
    } catch {
      // Ignore sign-out API errors — we still clear local state
    }
    await performLogout();
  }, [performLogout]);

  // ----------------------------------------------------------
  // Check auth (validate existing session)
  // ----------------------------------------------------------
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const tokensExist = await hasTokens();
      if (!tokensExist) {
        setUser(null);
        return;
      }
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      await clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ----------------------------------------------------------
  // On mount: validate session & wire up onUnauthorized
  // ----------------------------------------------------------
  useEffect(() => {
    apiClient.setOnUnauthorized(() => {
      performLogout();
    });

    checkAuth();
  }, [checkAuth, performLogout]);

  // ----------------------------------------------------------
  // Memoised context value
  // ----------------------------------------------------------
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      checkAuth,
    }),
    [user, isAuthenticated, isLoading, login, logout, checkAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================
// Hook
// ============================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
