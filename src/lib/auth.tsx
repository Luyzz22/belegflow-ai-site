"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  flowcheckApi,
  getToken,
  clearSession,
  USER_KEY,
  ApiError,
  type AppUser,
} from "@/lib/api-client";

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function readCachedUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(USER_KEY);
    return cached ? (JSON.parse(cached) as AppUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Optimistisch aus dem Cache (Lazy-Initializer — kein setState im Effect).
  const [user, setUser] = useState<AppUser | null>(readCachedUser);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const refresh = useCallback(async () => {
    try {
      const me = await flowcheckApi.me();
      setUser(me);
      if (typeof window !== "undefined") localStorage.setItem(USER_KEY, JSON.stringify(me));
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) logout();
    }
  }, [logout]);

  useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    // Token gegen /me validieren — alle State-Updates laufen asynchron in den Callbacks.
    flowcheckApi
      .me()
      .then((me) => {
        if (!active) return;
        setUser(me);
        if (typeof window !== "undefined") localStorage.setItem(USER_KEY, JSON.stringify(me));
      })
      .catch((e) => {
        if (active && e instanceof ApiError && (e.status === 401 || e.status === 403)) logout();
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [logout, router]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refresh }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth muss innerhalb von <AuthProvider> verwendet werden");
  return ctx;
}
