# Lead-Erfassung & Sales-Handoff (Minimal-Setup)

## Was bereits produktiv funktioniert
- Formularerfassung über `/kontakt` und `/demo`.
- Serverseitige Validierung über `POST /api/leads`.
- Einfache Missbrauchsabwehr:
  - Honeypot-Feld (`website`)
  - rudimentäres IP-basiertes Rate-Limit im Arbeitsspeicher.
- Strukturierte Rückgabe inkl. `lead_id`.

## Was nur vorbereitet ist
- CRM-/Automation-Anbindung erfolgt **nur**, wenn ein Webhook konfiguriert wird.
- Ohne Webhook läuft die API im `accepted_noop`-Modus (kein externer Versand).

## Konfiguration
Optional per ENV:

- `LEAD_WEBHOOK_URL` – Ziel-Webhook (z. B. eigenes Backend, HubSpot/Pipedrive-Bridge).
- `LEAD_WEBHOOK_TOKEN` – Optionaler Bearer-Token für den Webhook.

## Integrationshinweis
Für produktive CRM-Anbindung empfiehlt sich ein eigenes Integrations-Backend, das:
- Eingaben zusätzlich normalisiert,
- Auditierbarkeit/Retry-Logik übernimmt,
- datenschutzrechtliche Anforderungen (DSB prüfen) sauber dokumentiert.
