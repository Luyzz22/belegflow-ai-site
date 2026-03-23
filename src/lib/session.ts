const TOKEN_KEY = "bf_token";
const REFRESH_KEY = "bf_refresh";
const USER_KEY = "bf_user";
const TOKEN_COOKIE = "bf_session";

type StoredSession = {
  accessToken: string;
  refreshToken: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function getCookieMaxAge(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] || "")) as { exp?: number };
    if (!payload.exp) return 60 * 60 * 24;
    const ttl = payload.exp - Math.floor(Date.now() / 1000);
    return Math.max(60, Math.min(ttl, 60 * 60 * 24 * 30));
  } catch {
    return 60 * 60 * 24;
  }
}

function setSessionCookie(token: string) {
  if (!isBrowser()) return;
  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  const maxAge = getCookieMaxAge(token);
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secureFlag}`;
}

export function persistSession(session: StoredSession, user?: unknown) {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_KEY, session.refreshToken);
  setSessionCookie(session.accessToken);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function updateAccessToken(accessToken: string, refreshToken?: string) {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  setSessionCookie(accessToken);
}

export function clearSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getStoredToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser<T>() {
  if (!isBrowser()) return null;
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}

export function persistUser(user: unknown) {
  if (!isBrowser()) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
