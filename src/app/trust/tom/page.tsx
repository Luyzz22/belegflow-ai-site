import type { Metadata } from "next";
import PublicPage from "@/components/PublicPage";
import PrintButton from "@/components/PrintButton";

export const metadata: Metadata = {
  title: "Technisch-organisatorische Maßnahmen (TOM)",
  description: "Technisch-organisatorische Maßnahmen nach Art. 32 DSGVO für FlowCheck AI+.",
};

interface Control {
  nr: number;
  titel: string;
  massnahme: string;
  nachweis: string;
  status: string;
}

const CONTROLS: Control[] = [
  {
    nr: 1,
    titel: "Zutrittskontrolle",
    massnahme:
      "Die Server befinden sich in den Rechenzentren der Hetzner Online GmbH (Falkenstein/Nürnberg). Physischer Zutritt nur für autorisiertes Rechenzentrumspersonal, Videoüberwachung und Zutrittsprotokollierung.",
    nachweis: "ISO/IEC 27001:2022-Zertifizierung des Rechenzentrumsbetreibers.",
    status: "Umgesetzt",
  },
  {
    nr: 2,
    titel: "Zugangskontrolle",
    massnahme:
      "Serverzugang ausschließlich über SSH mit Public-Key-Authentifizierung. Passwort-Logins sind deaktiviert. Fail2ban blockiert wiederholte fehlgeschlagene Anmeldeversuche.",
    nachweis: "SSH-Konfiguration (PasswordAuthentication no), Fail2ban-Regeln.",
    status: "Umgesetzt",
  },
  {
    nr: 3,
    titel: "Zugriffskontrolle",
    massnahme:
      "Rollenbasiertes Berechtigungskonzept (Administrator/Benutzer). Authentifizierung über JWT. Der Anwendungsdienst läuft unter einem dedizierten, nicht privilegierten Benutzer (non-root).",
    nachweis: "Rollenmodell in der Anwendung, systemd-Service-User.",
    status: "Umgesetzt",
  },
  {
    nr: 4,
    titel: "Weitergabekontrolle",
    massnahme:
      "Sämtliche Datenübertragungen erfolgen ausschließlich verschlüsselt über TLS 1.3. Es finden keine unverschlüsselten Transfers statt. Encryption at Rest (AES-256) in der Datenbank.",
    nachweis: "TLS-Konfiguration, Datenbank-Verschlüsselung (Neon).",
    status: "Umgesetzt",
  },
  {
    nr: 5,
    titel: "Eingabekontrolle",
    massnahme:
      "Ein revisionssicherer Audit-Trail protokolliert alle sicherheitsrelevanten Aktionen (Upload, Freigabe, Ablehnung, Export) mit Zeitstempel und Benutzer.",
    nachweis: "Audit-Trail mit SHA-256-Prüfsummen (GoBD-konform).",
    status: "Umgesetzt",
  },
  {
    nr: 6,
    titel: "Auftragskontrolle",
    massnahme:
      "Mit allen Sub-Processoren bestehen Auftragsverarbeitungsverträge nach Art. 28 DSGVO. Drittlandtransfers sind durch EU-Standardvertragsklauseln (SCC) abgesichert.",
    nachweis: "AVV mit Anthropic, Hetzner, Neon, Vercel, Stripe.",
    status: "Umgesetzt",
  },
  {
    nr: 7,
    titel: "Verfügbarkeitskontrolle",
    massnahme:
      "Automatische Datenbank-Backups mit Point-in-Time Recovery (Neon). Der Anwendungsdienst wird über systemd automatisch neu gestartet (Auto-Restart).",
    nachweis: "Neon-Backup-Konfiguration, systemd Restart-Policy.",
    status: "Umgesetzt",
  },
  {
    nr: 8,
    titel: "Trennungsgebot",
    massnahme:
      "Mandantentrennung auf Anwendungsebene über die Benutzer-/Tenant-ID. Eine physische Trennung in separate Datenbanken ist in Vorbereitung.",
    nachweis: "Tenant-Filter in allen datenbezogenen Abfragen.",
    status: "Umgesetzt · Ausbau geplant (Roadmap)",
  },
];

export default function TomPage() {
  return (
    <PublicPage title="Technisch-organisatorische Maßnahmen" narrow>
      <div className="rounded-2xl bg-white p-8 text-sm leading-relaxed text-stone-600 shadow-sm ring-1 ring-stone-200/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-stone-400">Stand: Juni 2026 · nach Art. 32 DSGVO</p>
          <PrintButton />
        </div>

        <p className="mt-4">
          Die SBS Deutschland GmbH &amp; Co. KG trifft als Auftragsverarbeiter für FlowCheck AI+ die folgenden
          technischen und organisatorischen Maßnahmen zum Schutz personenbezogener Daten gemäß Art. 32 DSGVO.
        </p>

        <div className="mt-6 space-y-6">
          {CONTROLS.map((c) => (
            <section key={c.nr} className="border-t border-stone-200 pt-5">
              <h2 className="text-base font-semibold text-[#003856]">
                {c.nr}. {c.titel}
              </h2>
              <dl className="mt-2 space-y-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Maßnahme</dt>
                  <dd>{c.massnahme}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Nachweis</dt>
                  <dd>{c.nachweis}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Status</dt>
                  <dd className="font-medium text-emerald-700">{c.status}</dd>
                </div>
              </dl>
            </section>
          ))}
        </div>

        <p className="mt-8 text-xs text-stone-400">
          Die TOM werden regelmäßig überprüft und an den Stand der Technik angepasst. Fragen unter
          ki@sbsdeutschland.de.
        </p>
      </div>
    </PublicPage>
  );
}
