// Realistische Demo-Daten für ?demo=true (Live-Demos vor CFO/Investor).
import type {
  InvoiceListItem,
  InvoiceDetail,
  DashboardKpis,
  AuditEntry,
  Freigabe,
  Lieferant,
  LieferantDetail,
  InvoiceStatus,
} from "@/lib/api-client";

const DAY = 86_400_000;
const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * DAY).toISOString();

interface Seed {
  id: number;
  lieferant: string;
  nr: string;
  daysAgo: number;
  netto: number;
  satz: number;
  status: InvoiceStatus;
  iban: string;
  ustId: string;
  konto: string;
  zb?: string;
}

const SEEDS: Seed[] = [
  { id: 101, lieferant: "Müller & Brandt Maschinenbau GmbH", nr: "RE-2026-001", daysAgo: 3, netto: 6665.0, satz: 19, status: "verarbeitet", iban: "DE89370400440532013000", ustId: "DE811569869", konto: "4400", zb: "2% Skonto bei Zahlung innerhalb von 10 Tagen, netto 30 Tage" },
  { id: 102, lieferant: "Müller & Brandt Maschinenbau GmbH", nr: "RE-2026-014", daysAgo: 9, netto: 3210.5, satz: 19, status: "freigegeben", iban: "DE89370400440532013000", ustId: "DE811569869", konto: "4400" },
  { id: 103, lieferant: "Müller & Brandt Maschinenbau GmbH", nr: "RE-2026-031", daysAgo: 1, netto: 1180.0, satz: 19, status: "verarbeitet", iban: "DE89370400440532013000", ustId: "DE811569869", konto: "4400" },
  { id: 201, lieferant: "Böttcher AG Office Supplies", nr: "320251469588", daysAgo: 12, netto: 220.62, satz: 19, status: "exportiert", iban: "DE12500105170648489890", ustId: "DE114108795", konto: "6300" },
  { id: 202, lieferant: "Böttcher AG Office Supplies", nr: "320251470012", daysAgo: 6, netto: 89.9, satz: 19, status: "verarbeitet", iban: "DE12500105170648489890", ustId: "DE114108795", konto: "6300" },
  { id: 203, lieferant: "Böttcher AG Office Supplies", nr: "320251471455", daysAgo: 2, netto: 432.1, satz: 19, status: "verarbeitet", iban: "DE12500105170648489890", ustId: "DE114108795", konto: "6300" },
  { id: 204, lieferant: "Böttcher AG Office Supplies", nr: "320251472900", daysAgo: 18, netto: 156.0, satz: 19, status: "freigegeben", iban: "DE12500105170648489890", ustId: "DE114108795", konto: "6300" },
  { id: 401, lieferant: "TechVision Enterprises AG", nr: "TV-2026-7781", daysAgo: 5, netto: 22188.97, satz: 19, status: "verarbeitet", iban: "", ustId: "", konto: "4900" },
  { id: 402, lieferant: "TechVision Enterprises AG", nr: "TV-2026-7799", daysAgo: 8, netto: 4900.0, satz: 19, status: "freigegeben", iban: "DE21300209005044875115", ustId: "DE345678912", konto: "4900" },
  { id: 403, lieferant: "TechVision Enterprises AG", nr: "TV-2026-7810", daysAgo: 1, netto: 1290.0, satz: 19, status: "fehler", iban: "", ustId: "", konto: "" },
  { id: 501, lieferant: "Qonto Banking", nr: "QNT-0001", daysAgo: 20, netto: 29.0, satz: 19, status: "verarbeitet", iban: "DE91100110012620411214", ustId: "DE318527456", konto: "6855" },
  { id: 502, lieferant: "Qonto Banking", nr: "QNT-0002", daysAgo: 11, netto: 29.0, satz: 19, status: "verarbeitet", iban: "DE91100110012620411214", ustId: "DE318527456", konto: "6855" },
  { id: 503, lieferant: "Qonto Banking", nr: "QNT-0003", daysAgo: 0, netto: 49.0, satz: 19, status: "freigegeben", iban: "DE91100110012620411214", ustId: "DE318527456", konto: "6855" },
];

function brutto(netto: number, satz: number) {
  return Math.round(netto * (1 + satz / 100) * 100) / 100;
}

export function demoInvoices(): InvoiceListItem[] {
  return SEEDS.map((s) => ({
    id: s.id,
    lieferant: s.lieferant,
    rechnungsnummer: s.nr,
    datum: iso(s.daysAgo),
    betrag: brutto(s.netto, s.satz),
    waehrung: "EUR",
    status: s.status,
    created_at: iso(s.daysAgo),
  }));
}

export function demoInvoice(id: number): InvoiceDetail | undefined {
  const s = SEEDS.find((x) => x.id === id);
  if (!s) return undefined;
  const ust = Math.round(s.netto * (s.satz / 100) * 100) / 100;
  const anomalien =
    s.id === 401
      ? [{ typ: "Betragsausreißer", beschreibung: "Betrag liegt deutlich über dem Lieferanten-Durchschnitt.", schwere: "hoch" }]
      : [];
  return {
    id: s.id,
    lieferant: s.lieferant,
    rechnungsnummer: s.nr,
    datum: iso(s.daysAgo),
    betrag: brutto(s.netto, s.satz),
    netto: s.netto,
    ust_betrag: ust,
    ust_satz: s.satz,
    waehrung: "EUR",
    iban: s.iban,
    ust_id: s.ustId,
    status: s.status,
    kontierung: { konto: s.konto || "-", gegenkonto: s.konto ? "1200" : "-", steuerschluessel: s.konto ? "9" : "-" },
    validierung: {
      iban_valid: !!s.iban,
      ustid_valid: !!s.ustId,
      pflichtangaben: [
        { feld: "Rechnungsaussteller", vorhanden: true },
        { feld: "Rechnungsnummer", vorhanden: true },
        { feld: "Datum", vorhanden: true },
        { feld: "Betrag", vorhanden: true },
        { feld: "USt-Satz", vorhanden: true },
      ],
    },
    anomalien,
    zahlungsbedingungen: s.zb,
    created_at: iso(s.daysAgo),
  };
}

export function demoKpis(): DashboardKpis {
  const trend = Array.from({ length: 30 }, (_, i) => ({
    datum: iso(29 - i),
    anzahl: Math.max(0, Math.round(2 + Math.sin(i / 3) * 2 + (i > 24 ? 2 : 0))),
  }));
  return {
    rechnungen_heute: 2,
    rechnungen_monat: 15,
    rechnungen_quartal: 47,
    automatisierungsquote: 89,
    offene_freigaben: 8,
    aelteste_freigabe_stunden: 52,
    anomalie_alerts: 1,
    trend,
  };
}

export function demoLieferanten(): Lieferant[] {
  const groups = new Map<string, InvoiceListItem[]>();
  demoInvoices().forEach((i) => {
    const arr = groups.get(i.lieferant) ?? [];
    arr.push(i);
    groups.set(i.lieferant, arr);
  });
  const risk: Record<string, number> = {
    "Müller & Brandt Maschinenbau GmbH": 18,
    "Böttcher AG Office Supplies": 12,
    "TechVision Enterprises AG": 72,
    "Qonto Banking": 8,
  };
  return [...groups.entries()].map(([name, items]) => {
    const vol = items.reduce((s, i) => s + i.betrag, 0);
    return {
      name,
      anzahl_rechnungen: items.length,
      gesamtvolumen: Math.round(vol * 100) / 100,
      durchschnitt: Math.round((vol / items.length) * 100) / 100,
      letzte_rechnung: items.reduce((m, i) => (i.datum > m ? i.datum : m), items[0].datum),
      risiko_score: risk[name] ?? 25,
    };
  });
}

export function demoLieferantDetail(name: string): LieferantDetail {
  const rechnungen = demoInvoices().filter((i) => i.lieferant === name);
  return { name, rechnungen, statistik: {} };
}

export function demoFreigaben(): { items: Freigabe[] } {
  const items = demoInvoices()
    .filter((i) => i.status === "verarbeitet")
    .map((i, idx) => ({
      id: i.id,
      invoice_id: i.id,
      betrag: i.betrag,
      lieferant: i.lieferant,
      rechnungsnummer: i.rechnungsnummer,
      stufe: idx % 2 === 0 ? "Sachbearbeiter" : "Teamleiter",
      status: "ausstehend",
      erstellt_am: i.datum,
    }));
  return { items };
}

export function demoAudit(): { items: AuditEntry[]; total: number } {
  const items: AuditEntry[] = [
    { id: 1, aktion: "Upload", benutzer: "Luis Schenk", details: "RE-2026-031 hochgeladen", zeitpunkt: iso(0) },
    { id: 2, aktion: "Verarbeitet", benutzer: "FlowCheck KI", details: "RE-2026-031 extrahiert & validiert", zeitpunkt: iso(0) },
    { id: 3, aktion: "Freigegeben", benutzer: "Luis Schenk", details: "QNT-0003 freigegeben", zeitpunkt: iso(0) },
    { id: 4, aktion: "datev_export", benutzer: "Luis Schenk", details: "2 Buchungen exportiert, SHA-256 a3f29b71c4", zeitpunkt: iso(1) },
    { id: 5, aktion: "Abgelehnt", benutzer: "Luis Schenk", details: "TV-2026-7810: IBAN fehlt", zeitpunkt: iso(1) },
    { id: 6, aktion: "Upload", benutzer: "Portal", details: "TV-2026-7799 via Lieferanten-Portal", zeitpunkt: iso(8) },
  ];
  return { items, total: items.length };
}

export function demoDatev(): { items: Record<string, string | number>[]; total: number } {
  const items = demoInvoices()
    .filter((i) => i.status === "freigegeben" || i.status === "exportiert")
    .map((i) => {
      const d = demoInvoice(i.id)!;
      return {
        lieferant: i.lieferant,
        rechnungsnummer: i.rechnungsnummer,
        betrag: i.betrag,
        konto: d.kontierung.konto,
        gegenkonto: d.kontierung.gegenkonto,
        steuerschluessel: d.kontierung.steuerschluessel,
      };
    });
  return { items, total: items.length };
}
