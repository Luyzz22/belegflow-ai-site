"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Bot, Cpu } from "lucide-react";
import { flowcheckApi } from "@/lib/api-client";
import { num } from "@/lib/format";
import { getAccuracy } from "@/lib/kiFeedback";
import PageHeader from "@/components/PageHeader";

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

const TRANSPARENCY = [
  { title: "KI-Kennzeichnung", desc: "Alle KI-generierten Inhalte sind als solche gekennzeichnet (KI-Analyse-Tab, Confidence Score)." },
  { title: "Human-in-the-Loop", desc: "Keine automatische Freigabe ohne menschliche Bestätigung (Review-Modus)." },
  { title: "Modell-Transparenz", desc: "Das verwendete Verfahren wird angezeigt (Claude Sonnet / deterministischer Parser)." },
  { title: "Erklärbarkeit", desc: "Der Confidence-Breakdown zeigt, warum die KI so entschieden hat." },
];

const MODEL_CARD = [
  ["Verwendungszweck", "Extraktion von Rechnungsfeldern aus PDF/XML"],
  ["Trainingsansatz", "Pretrained LLM (Claude Sonnet), kein Fine-Tuning"],
  ["Bekannte Limitationen", "Gescannte Rechnungen mit niedriger Qualität"],
  ["Risikominderung", "Deterministische Validierung nach KI-Extraktion"],
  ["Menschliche Aufsicht", "Freigabe-Workflow erforderlich"],
];

export default function KiGovernancePage() {
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [accuracy, setAccuracy] = useState<{ pct: number; count: number }>({ pct: 0, count: 0 });

  const load = useCallback(() => {
    flowcheckApi.invoices("limit=1&offset=0").then((r) => setInvoiceCount(r.total || 0)).catch(() => {});
    Promise.resolve().then(() => setAccuracy(getAccuracy()));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="fc-fade-in">
      <PageHeader title="KI-Governance" description="Risikoklassifizierung & Transparenz nach EU AI Act" />

      {/* Klassifizierung */}
      <div className={`${CARD} mb-6`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-[#1a1a2e]">FlowCheck AI+ — Risikoklassifizierung</h2>
            <span className="mt-1 inline-block rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              Begrenztes Risiko · Art. 50 (Transparenzpflichten)
            </span>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-[#64748b]">
          FlowCheck AI+ nutzt KI zur Extraktion von Rechnungsdaten. Es handelt sich <strong>nicht</strong> um ein
          Hochrisiko-KI-System (Annex III), da keine Entscheidungen über natürliche Personen getroffen werden. Die
          Transparenzpflichten nach Art. 50 EU AI Act gelten ab dem 02.08.2026.
        </p>
      </div>

      {/* Transparenz-Maßnahmen */}
      <div className={`${CARD} mb-6`}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Transparenz-Maßnahmen (Art. 50)</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TRANSPARENCY.map((t) => (
            <div key={t.title} className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-[#1a1a2e]">{t.title}</p>
                <p className="text-xs text-[#64748b]">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monitoring */}
      <div className={`${CARD} mb-6`}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">KI-Monitoring</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Verarbeitete Rechnungen", value: num(invoiceCount) },
            { label: "Korrektur-Rate", value: accuracy.count > 0 ? `${100 - accuracy.pct}%` : "—", sub: accuracy.count > 0 ? `${accuracy.count} bewertet` : "noch keine Bewertung" },
            { label: "Modell-Verteilung", value: "KI / Parser", sub: "PDF via KI · XRechnung deterministisch" },
            { label: "Kosten", value: "—", sub: "vom Backend nicht übermittelt" },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-[rgba(0,56,86,0.08)] bg-[#faf9f7] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">{k.label}</p>
              <p className="mt-1 text-xl font-bold text-[#1a1a2e]">{k.value}</p>
              {k.sub && <p className="text-xs text-[#94a3b8]">{k.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Model Card */}
      <div className={CARD}>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[#1a1a2e]">
          <Cpu className="h-5 w-5 text-[#003856]" /> Model Card — FlowCheck KI-Extraktionsmodell (Art. 53)
        </h2>
        <dl className="divide-y divide-[rgba(0,56,86,0.06)]">
          {MODEL_CARD.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-sm font-medium text-[#1a1a2e]">{k}</dt>
              <dd className="text-sm text-[#64748b] sm:text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
