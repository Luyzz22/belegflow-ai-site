"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  flowcheckApi,
  getToken,
  clearSession,
  USER_KEY,
  type AppUser,
} from "@/lib/api-client";

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

// Auf diesen Seiten darf NIE zu /login umgeleitet werden (sonst Redirect-Schleife).
const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

function isAuthPage(): boolean {
  if (typeof window === "undefined") return false;
  return AUTH_PATHS.includes(window.location.pathname);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    if (!isAuthPage()) router.replace("/login");
  }, [router]);

  // Läuft GENAU EINMAL beim Mount. Bewusst leere Dependency-Liste:
  // weder `user`, `token`, `router` noch `logout` gehören hier hinein,
  // sonst würde der Effect bei jedem Re-Render neu laufen (→ /me-Endlosschleife).
  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    const onAuthPage = isAuthPage();

    // Kein Token → kein API-Call. Auf Auth-Seiten NICHT umleiten (verhindert Schleife).
    if (!token) {
      if (!onAuthPage) router.replace("/login");
      // setState asynchron, damit kein synchroner setState im Effect erfolgt (Lint/Render-Sicherheit).
      Promise.resolve().then(() => {
        if (!cancelled) setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }

    // Token vorhanden → genau EIN /me-Aufruf.
    flowcheckApi
      .me()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        if (typeof window !== "undefined") localStorage.setItem(USER_KEY, JSON.stringify(me));
      })
      .catch(() => {
        // Token ungültig/abgelaufen (z. B. 401) → verwerfen, kein Retry.
        if (cancelled) return;
        clearSession();
        setUser(null);
        if (!onAuthPage) router.replace("/login");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth muss innerhalb von <AuthProvider> verwendet werden");
  return ctx;
}
