"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getStoredRefreshToken, getStoredToken, getStoredUser, persistUser, updateAccessToken } from "@/lib/session";

const API = process.env.NEXT_PUBLIC_API_URL || "https://app.sbsdeutschland.com/api/erechnung";

export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  tenant_id: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    void checkAuth();
  }, []);

  const checkAuth = async () => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser<User>();

    if (!storedToken) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    setToken(storedToken);
    if (storedUser) {
      setUser(storedUser);
    }

    try {
      const res = await fetch(API + "/users/profile", { headers: { Authorization: "Bearer " + storedToken } });
      if (res.ok) {
        const profile = (await res.json()) as User;
        setUser(profile);
        persistUser(profile);
      } else if (res.status === 401) {
        const refreshed = await tryRefresh();
        if (!refreshed) {
          logout();
          return;
        }
      }
    } catch {
      // Netzwerkfehler: bestehende Session im UI sichtbar lassen.
    } finally {
      setLoading(false);
    }
  };

  const tryRefresh = async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(API + "/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return false;

      const data = (await res.json()) as { access_token: string; refresh_token: string };
      updateAccessToken(data.access_token, data.refresh_token);
      setToken(data.access_token);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setToken("");
    router.replace("/login");
  };

  return { user, loading, token, logout };
}
