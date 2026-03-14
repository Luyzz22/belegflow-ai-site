"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = "https://app.sbsdeutschland.com/api/erechnung";

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

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const stored = localStorage.getItem("bf_token");
    const storedUser = localStorage.getItem("bf_user");
    if (!stored) { router.replace("/login"); return; }
    setToken(stored);
    if (storedUser) { try { setUser(JSON.parse(storedUser)); } catch {} }
    try {
      const res = await fetch(API + "/users/profile", { headers: { Authorization: "Bearer " + stored } });
      if (res.ok) {
        const p = await res.json();
        setUser(p);
        localStorage.setItem("bf_user", JSON.stringify(p));
      } else if (res.status === 401) {
        const ok = await tryRefresh();
        if (!ok) { logout(); return; }
      }
    } catch {}
    setLoading(false);
  };

  const tryRefresh = async () => {
    const rt = localStorage.getItem("bf_refresh");
    if (!rt) return false;
    try {
      const res = await fetch(API + "/auth/refresh", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: rt }),
      });
      if (res.ok) {
        const d = await res.json();
        localStorage.setItem("bf_token", d.access_token);
        localStorage.setItem("bf_refresh", d.refresh_token);
        setToken(d.access_token);
        return true;
      }
    } catch {}
    return false;
  };

  const logout = () => {
    localStorage.removeItem("bf_token");
    localStorage.removeItem("bf_refresh");
    localStorage.removeItem("bf_user");
    router.replace("/login");
  };

  return { user, loading, token, logout };
}
