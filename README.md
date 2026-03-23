# BelegFlow AI Site

Öffentliche Next.js-Präsenz für BelegFlow AI mit Fokus auf vertrauenswürdige B2B-SaaS-Kommunikation für den deutschen Mittelstand.

## Kontakt- und Lead-Pfade

- `/demo`: Demo-Anfrage mit segmentierter Einordnung für Finance, Steuerberatung/DATEV-nahe Workflows sowie IT/Datenschutz/Einkauf.
- `/kontakt`: Produktgespräch, technische Rückfragen und Unterlagenanfrage.
- `POST /api/leads`: Serverseitige Validierung, Honeypot-Check und vorbereitete Handoff-Logik.

## Aktueller Integrationsstatus

Was **real funktioniert**:
- Formularvalidierung und Submission über `/api/leads`.
- Rudimentäres, in-memory Rate-Limit pro IP-Fenster.
- Strukturierte Antwort inkl. `lead_id`.

Was **vorbereitet** ist:
- Webhook-Zustellung (`LEAD_WEBHOOK_URL`, optional `LEAD_WEBHOOK_TOKEN`).
- Adapter-Platzhalter für HubSpot, Pipedrive und interne Notification-Mail (keine aktive Anbieterintegration ohne eigene technische Umsetzung).
- Optionaler externer Booking-Link per `NEXT_PUBLIC_BOOKING_URL` mit Fallback auf Demo/Kontakt.

Was **noch fehlt**:
- Persistentes Rate-Limit/Abuse-Protection (z. B. Redis).
- Verbindliche CRM-Mappings und Retry-/Dead-Letter-Handling.
- Juristisch finalisierte Texte zu Datenschutz/Compliance.

## Optionale ENV-Variablen

- `LEAD_WEBHOOK_URL`
- `LEAD_WEBHOOK_TOKEN`
- `LEAD_HUBSPOT_ENABLED` (Vorbereitung, derzeit kein aktiver Versand)
- `LEAD_PIPEDRIVE_ENABLED` (Vorbereitung, derzeit kein aktiver Versand)
- `LEAD_NOTIFICATION_EMAIL` (Vorbereitung, derzeit keine Mailzustellung)
- `NEXT_PUBLIC_BOOKING_URL` (externer Terminlink)

## Rechtlich sensible Stellen (vor Veröffentlichung prüfen)

- Formulierungen zu Datenschutzrollen und Anfragebearbeitung: **DSB prüfen**.
- Einordnung zu GoBD / E-Rechnung / DATEV-Workflows: **steuerlich validieren**.
- Aussagen zu Integrationen, SLA, Betriebszusagen: **Claim nur nach technischer Bestätigung veröffentlichen**.
- Vertragsnahe Aussagen (AVV, TOMs, Subprocessor): **juristisch prüfen**.
