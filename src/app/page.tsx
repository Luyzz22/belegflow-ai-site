"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProcurementCta from "@/components/ProcurementCta";

export default function HomePage() {
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = new Date("2027-01-01T00:00:00+01:00").getTime() - Date.now();
      if (diff <= 0) return;
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa]">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-[#0a0a0a]/70 backdrop-blur-2xl border-b border-white/[0.06] z-50">
        <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#e85d04] rounded-lg flex items-center justify-center font-bold text-sm">BF</div>
            <span className="text-[22px]" style={{ fontFamily: "'Instrument Serif', serif" }}>BelegFlow AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Ablauf", "Preise", "Guide", "Trust Center"].map(s => (
              <a key={s} href={s === "Guide" ? "/guide" : s === "Trust Center" ? "/compliance" : "#" + s.toLowerCase()} className="text-sm text-[#a3a3a3] hover:text-white transition">{s}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 border border-white/[0.12] rounded-lg text-sm hover:bg-white/[0.04] transition">Login</Link>
            <Link href="/demo" className="px-4 py-2 bg-[#e85d04] rounded-lg text-sm font-semibold hover:bg-[#f48c06] transition">Demo anfragen</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-[72px]">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#e85d04]/10 border border-[#e85d04]/20 rounded-full text-sm text-[#f48c06] font-medium mb-8">
          <span className="w-2 h-2 bg-[#e85d04] rounded-full animate-pulse" /> E-Rechnung: Empfangspflicht seit 01.01.2025
        </div>
        <h1 className="text-[clamp(3rem,7vw,5.5rem)] leading-[1.05] font-normal max-w-[900px] mb-6" style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: "-0.03em" }}>
          Belege verarbeiten.<br /><em className="text-[#f48c06]">Automatisch.</em>
        </h1>
        <p className="text-[clamp(1rem,2vw,1.25rem)] text-[#a3a3a3] max-w-[700px] mb-12 font-light">
          BelegFlow AI erkennt, validiert, kontiert und exportiert Ihre Eingangsrechnungen mit KI — mit GoBD-orientierter Prüfspur, DATEV-kompatiblem Export und KI-Kontierung nach SKR03/SKR04 mit Begründung &amp; Confidence.
        </p>
        <div className="flex items-center gap-4 mb-16 flex-wrap justify-center">
          <Link href="/register" className="px-8 py-3.5 bg-[#e85d04] rounded-xl font-semibold hover:bg-[#f48c06] hover:shadow-[0_8px_32px_rgba(232,93,4,0.3)] transition">30 Tage kostenlos testen</Link>
          <a href="#ablauf" className="px-8 py-3.5 border border-white/[0.12] rounded-xl hover:bg-white/[0.04] transition">So funktioniert&apos;s →</a>
        </div>
        <div className="flex items-center gap-8 flex-wrap justify-center">
          {[["<3s", "Pro Rechnung"], ["SKR03/04", "KI-Kontierung"], ["KoSIT", "Validierung"], ["Batch", "DATEV-Export"]].map(([v, l], i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[28px] font-bold">{v}</span>
              <span className="text-[12px] text-[#737373] uppercase tracking-[0.08em] font-medium">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Countdown */}
      <section className="px-6 -mt-10 mb-24 relative z-10">
        <div className="max-w-[1100px] mx-auto bg-[#e85d04]/[0.06] border border-[#e85d04]/15 rounded-[20px] p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-[32px] mb-3" style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: "-0.02em" }}>E-Rechnung wird Pflicht.</h2>
            <p className="text-[#a3a3a3] text-[15px] max-w-[560px] leading-relaxed">
              Seit dem 1. Januar 2025 müssen B2B-Unternehmen in Deutschland E-Rechnungen empfangen können. Die Versandpflicht wird je nach Unternehmensgröße über Übergangsfristen gestaffelt eingeführt.
            </p>
          </div>
          <div className="flex gap-4">
            {[["d", "Tage"], ["h", "Std"], ["m", "Min"], ["s", "Sek"]].map(([k, l]) => (
              <div key={k} className="flex flex-col items-center gap-1.5">
                <div className="w-[72px] h-[72px] flex items-center justify-center bg-white/[0.04] border border-white/[0.08] rounded-[14px] text-[28px] font-bold tabular-nums">
                  {k === "d" ? countdown.d : String((countdown as any)[k]).padStart(2, "0")}
                </div>
                <span className="text-[11px] text-[#737373] uppercase tracking-[0.1em] font-medium">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 bg-[#0f0f0f]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[12px] uppercase tracking-[0.12em] text-[#e85d04] font-semibold mb-4">Features</p>
            <h2 className="text-[clamp(2rem,4vw,3.2rem)]" style={{ fontFamily: "'Instrument Serif', serif", letterSpacing: "-0.03em" }}>Alles, was Ihre Buchhaltung braucht</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06] rounded-[20px] overflow-hidden">
            {[
              ["🤖", "KI-Kontierung (SKR03/SKR04)", "Kontierungsvorschläge mit Begründung und Confidence als Entscheidungshilfe."],
              ["✅", "KoSIT-validierte Verarbeitung", "XRechnung- und ZUGFeRD-Prüfung inkl. validierungsnahem Workflow."],
              ["🧾", "Duplikaterkennung", "Mögliche Dubletten mit Score und Gründen frühzeitig erkennen."],
              ["📋", "GoBD-orientierte Prüfspur", "Audit-Trail über Upload, Prüfung, Freigabe und Export."],
              ["📊", "Budget-Tracking", "Ist/Budget-Vergleiche nach Kategorien und Monaten."],
              ["📤", "Finance Copilot & Batch-Export", "KI-gestützte Auswertungen und DATEV-kompatibler Batch-Export."],
            ].map(([icon, title, desc], i) => (
              <div key={i} className="bg-[#0f0f0f] p-10 hover:bg-[#171717] transition">
                <div className="w-12 h-12 flex items-center justify-center bg-[#e85d04]/15 rounded-xl mb-6 text-[22px]">{icon}</div>
                <h3 className="text-[17px] font-semibold mb-2">{title}</h3>
                <p className="text-[14px] text-[#737373] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="ablauf" className="px-6 py-24">
        <div className="max-w-[1000px] mx-auto text-center">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[#e85d04] font-semibold mb-4">Ablauf</p>
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] mb-16" style={{ fontFamily: "'Instrument Serif', serif" }}>In 4 Schritten zur Automatisierung</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[["1", "Hochladen", "PDF, E-Mail oder XRechnung"], ["2", "Validieren & Verarbeiten", "Empfang, Verarbeitung und KoSIT-Checks"], ["3", "Prüfen", "KI-Vorschläge prüfen, korrigieren, freigeben"], ["4", "Exportieren", "DATEV-kompatibler Export (einzeln oder Batch)"]].map(([n, t, d]) => (
              <div key={n} className="text-center">
                <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center bg-[#171717] border-2 border-[#e85d04] rounded-full text-[18px] font-bold text-[#f48c06]">{n}</div>
                <h3 className="text-[16px] font-semibold mb-2">{t}</h3>
                <p className="text-[13px] text-[#737373]">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="preise" className="px-6 py-24">
        <div className="max-w-[1000px] mx-auto text-center">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[#e85d04] font-semibold mb-4">Preise</p>
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] mb-16" style={{ fontFamily: "'Instrument Serif', serif" }}>Transparent. Ohne Überraschungen.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06] rounded-[20px] overflow-hidden">
            {[
              { tier: "Starter", price: "€0", sub: "50 Belege/Monat", features: ["50 Rechnungen/Monat", "KI-Auslesung & Vorschläge", "DATEV-kompatibler CSV-Export", "1 Benutzer"], featured: false },
              { tier: "Professional", price: "€149", sub: "500 Belege/Monat", features: ["500 Rechnungen/Monat", "SKR03/SKR04-Kontierungsvorschläge", "DATEV-kompatibler Export + Batch", "Freigabe-Workflows & Audit-Trail", "Finance Copilot", "5 Benutzer"], featured: true },
              { tier: "Enterprise", price: "Individuell", sub: "Unbegrenzt", features: ["Unbegrenzte Rechnungen", "SSO / SAML", "API-Zugang", "Dedicated Manager", "On-Premise Option"], featured: false },
            ].map((p, i) => (
              <div key={i} className={"p-10 flex flex-col " + (p.featured ? "bg-[#171717] relative" : "bg-[#0a0a0a]")}>
                {p.featured && <div className="absolute top-0 left-0 right-0 py-1.5 bg-[#e85d04] text-center text-[12px] font-semibold">Empfohlen</div>}
                <div className={p.featured ? "pt-6" : ""}>
                  <p className="text-[14px] text-[#737373] uppercase tracking-[0.08em] font-medium mb-2">{p.tier}</p>
                  <p className="text-[42px] font-bold tracking-tight mb-1">{p.price}<span className="text-[16px] font-normal text-[#737373]"> {p.price !== "Individuell" ? "/ Monat" : ""}</span></p>
                  <p className="text-[13px] text-[#737373] mb-8 pb-8 border-b border-white/[0.06]">{p.sub}</p>
                  <ul className="flex-1 space-y-3 mb-8 text-left">
                    {p.features.map((f, j) => <li key={j} className="flex items-start gap-2.5 text-[14px] text-[#d4d4d4]"><span className="text-emerald-500 font-bold mt-0.5">✓</span>{f}</li>)}
                  </ul>
                  {p.featured
                    ? <Link href="/register" className="block w-full py-3 bg-[#e85d04] rounded-xl text-center font-semibold hover:bg-[#f48c06] transition">30 Tage kostenlos testen</Link>
                    : p.tier === "Enterprise"
                      ? <a href="mailto:ki@sbsdeutschland.de" className="block w-full py-3 border border-white/[0.15] rounded-xl text-center hover:bg-white/[0.04] transition">Kontakt</a>
                      : <Link href="/register" className="block w-full py-3 border border-white/[0.15] rounded-xl text-center hover:bg-white/[0.04] transition">Kostenlos starten</Link>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProcurementCta />

      <section className="px-6 pb-20">
        <div className="max-w-[1100px] mx-auto bg-[#111111] border border-white/[0.08] rounded-2xl p-8">
          <h2 className="text-2xl text-white mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>Trust Center & Beschaffung</h2>
          <p className="text-sm text-[#a3a3a3] mb-5">Für IT, Datenschutz, Einkauf und CFO: Sicherheitsüberblick, Compliance-Einordnung, AVV-Infos, FAQ und API-Zugang zentral gebündelt.</p>
          <div className="flex flex-wrap gap-2">
            {[
              ["/sicherheit", "Sicherheit"],
              ["/compliance", "Compliance"],
              ["/avv", "AVV"],
              ["/faq", "FAQ"],
              ["/api-docs", "API / OpenAPI"],
              ["/kontakt", "Technische Rückfrage senden"],
              ["/demo", "Demo anfragen"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="px-4 py-2 rounded-lg border border-[#303030] text-sm text-[#d4d4d4] hover:border-[#e85d04]/60 hover:text-white transition">{label}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/[0.06]">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-[#525252]">© 2026 BelegFlow AI — Ein Produkt von SBS Deutschland GmbH & Co. KG</p>
          <div className="flex gap-6 flex-wrap justify-center">
            <a href="mailto:ki@sbsdeutschland.de" className="text-[13px] text-[#525252] hover:text-[#a3a3a3]">Kontakt</a>
            <a href="/impressum" className="text-[13px] text-[#525252] hover:text-[#a3a3a3]">Impressum</a>
            <a href="/datenschutz" className="text-[13px] text-[#525252] hover:text-[#a3a3a3]">Datenschutz</a>
          </div>
        </div>
        <p className="max-w-[1100px] mx-auto mt-4 text-[11px] text-[#525252]">
          Rechtlicher Hinweis: Aussagen zu regulatorischen Pflichten und steuerlichen Anforderungen sind produktbezogene Orientierung und ersetzen keine Rechts- oder Steuerberatung (juristisch prüfen / steuerlich validieren / Claim nur nach technischer Bestätigung veröffentlichen).
        </p>
      </footer>
    </div>
  );
}
