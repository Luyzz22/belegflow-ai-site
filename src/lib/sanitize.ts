// XSS-Prävention: HTML-Sonderzeichen in Benutzereingaben neutralisieren,
// bevor sie persistiert oder außerhalb der React-Textauslieferung verwendet werden.

export function sanitize(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Sanitisiert alle String-Felder eines Objekts (flach). */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = { ...obj };
  for (const key of Object.keys(result)) {
    const value = result[key];
    if (typeof value === "string") {
      result[key] = sanitize(value);
    }
  }
  return result as T;
}
