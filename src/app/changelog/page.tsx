import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Changelog" };

const releases = [
  {
    version: "1.0.0", date: "15. März 2026", tag: "Launch",
    changes: [
      "KI-Rechnungserkennung mit Gemini 2.0 Flash + Claude Sonnet",
      "Automatische Kontierung (SKR03/04) mit 90%+ Konfidenz",
      "DATEV-Export (nativ + Batch)",
      "Freigabe-Workflow mit State Machine (9 States)",
      "Finance Copilot — KI-Chat für Rechnungseingang",
      "Dashboard mit Live-KPIs und Analytics (recharts)",
      "Team-Management mit RBAC (Admin/Editor/Viewer)",
      "E-Mail Ingestion (IMAP, 5-Min-Intervall)",
      "GoBD-konforme SHA-256 Hash-Chain-Archivierung",
      "KoSIT-Validierung für XRechnung & ZUGFeRD",
      "Stripe Billing (Starter/Professional/Enterprise)",
      "Resend Transaktionale E-Mails (Invite/Welcome/Reset)",
      "Onboarding Wizard für Erstnutzer",
      "E-Rechnung Guide (SEO Content)",
      "Impressum, Datenschutz & AGB",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4]">
      <nav className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e85d04] rounded-lg flex items-center justify-center font-bold text-white text-xs">BF</div>
            <span className="text-lg font-bold text-white" style={{fontFamily:"'Instrument Serif',serif"}}>BelegFlow AI</span>
          </Link>
          <Link href="/register" className="px-4 py-2 bg-[#e85d04] rounded-lg text-sm font-medium text-white hover:bg-[#f48c06] transition">Kostenlos testen</Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3" style={{fontFamily:"'Instrument Serif',serif"}}>Changelog</h1>
          <p className="text-[#a3a3a3]">Alle Updates und neue Features von BelegFlow AI.</p>
        </div>
        {releases.map((r, i) => (
          <div key={i} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-mono font-bold text-[#e85d04]">v{r.version}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#e85d04]/10 text-[#f48c06] border border-[#e85d04]/20 font-medium">{r.tag}</span>
              <span className="text-xs text-[#525252]">{r.date}</span>
            </div>
            <div className="border-l-2 border-[#262626] pl-6 space-y-2">
              {r.changes.map((c, j) => (
                <div key={j} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                  <span className="text-sm text-[#a3a3a3]">{c}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="pt-8 border-t border-white/[0.06]">
          <Link href="/" className="text-sm text-[#e85d04] hover:text-[#f48c06]">← Zurück zur Startseite</Link>
        </div>
      </div>
    </div>
  );
}
