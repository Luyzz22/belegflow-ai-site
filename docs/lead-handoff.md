# Lead-Erfassung & Sales-Handoff (Minimal-Setup)

## Was bereits produktiv funktioniert
- Formularerfassung über `/kontakt` und `/demo`.
- Serverseitige Validierung über `POST /api/leads`.
- Einfache Missbrauchsabwehr:
  - Honeypot-Feld (`website`)
  - rudimentäres IP-basiertes Rate-Limit im Arbeitsspeicher.
- Strukturierte Rückgabe inkl. `lead_id` und Handoff-Status pro Kanal.

## Was nur vorbereitet ist
- CRM-/Automation-Anbindung erfolgt **nur**, wenn Integrationsparameter gesetzt sind.
- Adapterstruktur vorbereitet für:
  - generischen Webhook
  - HubSpot (Placeholder)
  - Pipedrive (Placeholder)
  - interne Notification-E-Mail (Placeholder)
- Ohne aktive Konfiguration läuft die API im `accepted_noop`-Modus (kein externer Versand).

## Konfiguration (optional)

- `LEAD_WEBHOOK_URL` – Ziel-Webhook (z. B. eigenes Backend, HubSpot/Pipedrive-Bridge).
- `LEAD_WEBHOOK_TOKEN` – Optionaler Bearer-Token für den Webhook.
- `LEAD_HUBSPOT_ENABLED` – signalisiert spätere HubSpot-Anbindung (derzeit kein aktiver Versand).
- `LEAD_PIPEDRIVE_ENABLED` – signalisiert spätere Pipedrive-Anbindung (derzeit kein aktiver Versand).
- `LEAD_NOTIFICATION_EMAIL` – signalisiert späteren Notification-Mail-Kanal.

Optional für Terminbuchung:

- `NEXT_PUBLIC_BOOKING_URL` – externer Terminlink. Ohne Wert bleibt der Fallback auf `/demo`.

## Integrationshinweis
Für produktive CRM-Anbindung empfiehlt sich ein eigenes Integrations-Backend, das:
- Eingaben zusätzlich normalisiert,
- Auditierbarkeit/Retry-Logik übernimmt,
- datenschutzrechtliche Anforderungen (DSB prüfen) sauber dokumentiert,
- SLA-/Incident-Handling vertraglich sauber abbildet (juristisch prüfen).
