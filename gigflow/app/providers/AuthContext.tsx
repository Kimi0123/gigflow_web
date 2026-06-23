"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrentUserApi,
  type AuthUser,
} from "../lib/api/authApi";
import {
  clearAuthSession,
  getSavedToken,
  saveAuthSession,
} from "../lib/cookies/authCookies";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setSession: (token: string, user: AuthUser, remember?: boolean) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const savedToken = getSavedToken();

    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    setToken(savedToken);

    try {
      const response = await getCurrentUserApi(savedToken);
      setUser(response.data);
      saveAuthSession(savedToken, response.data, true);
    } catch {
      clearAuthSession();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const refreshTimer = window.setTimeout(() => {
      void refreshUser();
    }, 0);

    return () => window.clearTimeout(refreshTimer);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      setSession: (nextToken, nextUser, remember = true) => {
        saveAuthSession(nextToken, nextUser, remember);
        setToken(nextToken);
        setUser(nextUser);
      },
      refreshUser,
      logout: () => {
        clearAuthSession();
        setToken(null);
        setUser(null);
      },
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
