"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { normalizeMe, type AppUser, type Entitlement } from "@/lib/api-client";

interface AuthState {
  user: AppUser | null;
  entitlement: Entitlement | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  entitlement: null,
  loading: true,
  logout: () => {},
});

const MAX_SESSION_MS = 8 * 60 * 60 * 1000; // 8 Stunden
const REVALIDATE_AFTER_MS = 30 * 60 * 1000; // 30 Minuten

/** Liest die Claims (iat/exp in Sekunden) aus einem JWT, ohne Verifikation. */
function readJwtClaims(token: string): { exp?: number; iat?: number } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as { exp?: number; iat?: number };
  } catch {
    return null;
  }
}

/** True, wenn der Token abgelaufen ist oder die maximale Sitzungsdauer überschreitet. */
function isTokenExpired(token: string): boolean {
  const claims = readJwtClaims(token);
  if (!claims) return false; // Kein lesbarer Claim → serverseitige /me-Prüfung entscheidet.
  const now = Date.now();
  if (typeof claims.exp === "number" && now >= claims.exp * 1000) return true;
  if (typeof claims.iat === "number" && now - claims.iat * 1000 > MAX_SESSION_MS) return true;
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [concurrentWarning, setConcurrentWarning] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem("flowcheck_token");
    localStorage.removeItem("flowcheck_user");
    localStorage.removeItem("fc_last_check");
    window.location.href = "/login";
  }, []);

  // Initiale Validierung — läuft genau EINMAL beim Mount. Nur im (app)-Layout.
  useEffect(() => {
    const token = localStorage.getItem("flowcheck_token");

    if (!token || isTokenExpired(token)) {
      localStorage.removeItem("flowcheck_token");
      localStorage.removeItem("flowcheck_user");
      window.location.href = "/login";
      return;
    }

    fetch("/api/app/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((raw: unknown) => {
        // /me kommt als { user, entitlement } (neu) ODER flach (alt).
        const { user: me, entitlement: ent } = normalizeMe(raw);
        let stored: Partial<AppUser> = {};
        try {
          const s = localStorage.getItem("flowcheck_user");
          if (s) stored = JSON.parse(s) as Partial<AppUser>;
        } catch {
          stored = {};
        }
        localStorage.setItem("fc_last_check", String(Date.now()));
        // /me liefert keinen Namen → aus dem beim Login gespeicherten User ergänzen.
        setUser({ name: stored.name, ...me });
        setEntitlement(ent);
      })
      .catch(() => {
        localStorage.removeItem("flowcheck_token");
        localStorage.removeItem("flowcheck_user");
        window.location.href = "/login";
      })
      .finally(() => setLoading(false));
  }, []);

  // Re-Validierung, wenn der Tab nach längerer Inaktivität wieder sichtbar wird.
  useEffect(() => {
    const revalidate = () => {
      const token = localStorage.getItem("flowcheck_token");
      if (!token || isTokenExpired(token)) {
        logout();
        return;
      }
      fetch("/api/app/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          localStorage.setItem("fc_last_check", String(Date.now()));
        })
        .catch(() => logout());
    };

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const last = Number(localStorage.getItem("fc_last_check") || "0");
      if (!last || Date.now() - last > REVALIDATE_AFTER_MS) revalidate();
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [logout]);

  // Parallele Anmeldung in einem anderen Tab erkennen (storage-Event).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "flowcheck_token") return;
      // Token entfernt (Logout im anderen Tab) → diese Sitzung ebenfalls beenden.
      if (e.newValue === null) {
        logout();
        return;
      }
      // Token geändert (neue Anmeldung im anderen Tab) → Hinweis anzeigen.
      if (e.oldValue && e.newValue !== e.oldValue) setConcurrentWarning(true);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [logout]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f6f3] text-sm text-stone-500">
        Laden …
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, entitlement, loading, logout }}>
      {concurrentWarning && (
        <div className="fixed inset-x-0 top-0 z-[300] flex flex-wrap items-center justify-center gap-3 bg-amber-500 px-4 py-2.5 text-center text-sm font-medium text-[#1a1a2e] print:hidden">
          <span>⚠️ In einem anderen Tab oder Gerät wurde eine neue Anmeldung erkannt.</span>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-[#1a1a2e] px-3 py-1 text-xs font-semibold text-white transition hover:bg-black"
          >
            Aktualisieren
          </button>
          <button
            onClick={() => setConcurrentWarning(false)}
            className="rounded-lg px-3 py-1 text-xs font-medium text-[#1a1a2e]/70 transition hover:text-[#1a1a2e]"
          >
            Schließen
          </button>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
