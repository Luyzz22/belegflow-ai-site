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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.replace("/login");
  }, [router]);

  // Läuft GENAU EINMAL beim Mount. Bewusst leere Dependency-Liste:
  // weder `user`, `token`, `router` noch `logout` gehören hier hinein,
  // sonst würde der Effect bei jedem Re-Render neu laufen (→ /me-Endlosschleife).
  useEffect(() => {
    const token = getToken();

    // Kein Token → kein API-Call, sofort als „nicht eingeloggt" behandeln.
    if (!token) {
      router.replace("/login");
      return;
    }

    let active = true;
    flowcheckApi
      .me()
      .then((me) => {
        if (!active) return;
        setUser(me);
        if (typeof window !== "undefined") localStorage.setItem(USER_KEY, JSON.stringify(me));
      })
      .catch(() => {
        // Token ungültig/abgelaufen (z. B. 401) → Token verwerfen, kein Retry.
        if (!active) return;
        clearSession();
        setUser(null);
        router.replace("/login");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
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
