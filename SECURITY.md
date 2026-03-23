# Security Hinweise (Repository: belegflow-ai-site)

Dieses Repository enthält die öffentliche Next.js-Oberfläche sowie Dashboard-Seiten, die mit einer externen API kommunizieren.

## Technisch umgesetzte Defaults in diesem Repo

- Sicherheitsheader über `src/middleware.ts`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Dashboard-Routen werden in der Middleware auf eine vorhandene Session-Cookie geprüft (`bf_session`) und bei fehlender Session auf `/login` umgeleitet.
- Frontend-seitige Session-Synchronisierung zwischen LocalStorage und Cookie (`src/lib/session.ts`).

## Bekannte Grenzen / technische Schulden

- Das Session-Cookie wird clientseitig gesetzt und ist **nicht** `HttpOnly` (Frontend kann `HttpOnly` nicht selbst setzen).
- Verbindliche Session-Invalidierung und harte Token-Policies müssen serverseitig in der API umgesetzt werden.
- Rollen- und Rechteprüfung erfolgt primär serverseitig; UI-Gates sind nur zusätzliche Schutzschicht für Bedienfehler.

## Responsible Disclosure

Bitte sicherheitsrelevante Hinweise vertraulich an das Betreiberteam melden:

- E-Mail: `ki@sbsdeutschland.de`
- Betreff: `Security Disclosure BelegFlow AI`

Bitte keine öffentlichen Exploit-Details vor einem abgestimmten Fix veröffentlichen.
