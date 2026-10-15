"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as api from "@/lib/api";
import type { User } from "@/lib/types";

const STORAGE_KEY = "revonest.user";

interface AuthContextValue {
  user: User | null;
  /** True until we've read localStorage on first load (avoids UI flicker). */
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate the session from localStorage once, on mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored) as User);
    } catch {
      // ignore malformed storage
    } finally {
      setLoading(false);
    }
  }, []);

  function persist(next: User | null) {
    setUser(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable (private mode etc.) — session stays in memory
    }
  }

  async function login(email: string, password: string): Promise<User> {
    const res = await api.login(email, password);
    persist(res.user);
    return res.user;
  }

  async function register(
    username: string,
    email: string,
    password: string
  ): Promise<User> {
    // Create the account, then log in so the session is established.
    await api.register(username, email, password);
    return login(email, password);
  }

  function logout() {
    persist(null);
  }

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: user !== null,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook to read auth state. Throws if used outside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
