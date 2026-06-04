"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AppUser } from "@/lib/api-client";

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Läuft genau EINMAL beim Mount. Dieser Provider existiert nur im (app)-Layout
  // (geschützte Routen) — niemals auf /login, /register, /forgot-password.
  useEffect(() => {
    const token = localStorage.getItem("flowcheck_token");

    if (!token) {
      // Hard-Redirect — die Seite wird ohnehin entladen, kein setState nötig.
      window.location.href = "/login";
      return;
    }

    fetch("/api/app/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((data: AppUser) => setUser(data))
      .catch(() => {
        localStorage.removeItem("flowcheck_token");
        localStorage.removeItem("flowcheck_user");
        window.location.href = "/login";
      })
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    localStorage.removeItem("flowcheck_token");
    localStorage.removeItem("flowcheck_user");
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7fa] text-sm text-stone-500">
        Laden …
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
