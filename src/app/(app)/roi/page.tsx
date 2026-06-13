"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ReferenceLine,
} from "recharts";
import { Clock, Wallet, ShieldAlert, Printer, ChevronDown, TrendingUp } from "lucide-react";
import { flowcheckApi } from "@/lib/api-client";
import { eur, num } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import CountUp from "@/components/CountUp";

// Automatisierungs-Annahmen (klar als Richtwerte ausgewiesen).
const AUTO_MIN = 0.75; // 45 Sekunden
const FEHLER_AUTO = 0.3; // %

interface RoiInputs {
  rechnungen: number;
  minManuell: number;
  stundensatz: number;
  fehlerManuell: number;
  kostenProFehler: number;
  lizenzMonat: number;
}

const DEFAULTS: RoiInputs = {
  rechnungen: 0,
  minManuell: 8,
  stundensatz: 45,
  fehlerManuell: 4,
  kostenProFehler: 85,
  lizenzMonat: 349,
};

function loadRoi(): RoiInputs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem("flowcheck_roi");
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<RoiInputs>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";
const INPUT =
  "w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20";
const LABEL = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#64748b]";

function ResultCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Clock;
  label: string;
  value: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#003856] to-[#005580] p-6 text-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#ffb900]">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-white/60">{label}</p>
      <p className="mt-1 text-4xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-[#ffb900]">{sub}</p>
    </div>
  );
}

export default function RoiPage() {
  const [inputs, setInputs] = useState<RoiInputs>(() => loadRoi());
  const [showFormula, setShowFormula] = useState(false);

  // Default-Rechnungsmenge aus dem Dashboard, falls noch nicht gesetzt.
  useEffect(() => {
    if (loadRoi().rechnungen > 0) return;
    flowcheckApi
      .kpis()
      .then((k) => setInputs((p) => (p.rechnungen > 0 ? p : { ...p, rechnungen: k.rechnungen_monat || 0 })))
      .catch(() => {});
  }, []);

  // Persistieren.
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("flowcheck_roi", JSON.stringify(inputs));
  }, [inputs]);

  const set = (patch: Partial<RoiInputs>) => setInputs((p) => ({ ...p, ...patch }));

  const calc = useMemo(() => {
    const { rechnungen, minManuell, stundensatz, fehlerManuell, kostenProFehler, lizenzMonat } = inputs;
    const zeitStd = (rechnungen * (minManuell - AUTO_MIN) * 12) / 60;
    const kostenErsparnis = zeitStd * stundensatz;
    const fehlerVermeidung = rechnungen * ((fehlerManuell - FEHLER_AUTO) / 100) * 12;
    const fehlerKosten = fehlerVermeidung * kostenProFehler;
    const gesamt = kostenErsparnis + fehlerKosten;
    const lizenzJahr = lizenzMonat * 12;
    const roi = lizenzJahr > 0 ? ((gesamt - lizenzJahr) / lizenzJahr) * 100 : 0;
    const prozentSchneller = minManuell > 0 ? ((minManuell - AUTO_MIN) / minManuell) * 100 : 0;
    const monthlySaving = gesamt / 12;
    const breakEven = monthlySaving > 0 ? Math.ceil(lizenzJahr / monthlySaving) : null;
    return {
      zeitStd,
      kostenErsparnis,
      fehlerVermeidung,
      gesamt,
      lizenzJahr,
      roi,
      prozentSchneller,
      monthlySaving,
      breakEven,
    };
  }, [inputs]);

  const chartData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        monat: `M${i + 1}`,
        ersparnis: Math.round(calc.monthlySaving * (i + 1)),
        lizenz: Math.round(calc.lizenzJahr),
      })),
    [calc]
  );

  const kostenManuell = (inputs.stundensatz * inputs.minManuell) / 60;
  const kostenAuto =
    (inputs.stundensatz * AUTO_MIN) / 60 + (inputs.rechnungen > 0 ? inputs.lizenzMonat / inputs.rechnungen : 0);

  return (
    <div className="fc-fade-in">
      <PageHeader
        title="ROI-Rechner"
        description="Wie viel spart FlowCheck AI+ Ihrem Unternehmen?"
        action={
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] px-5 py-2.5 font-medium text-[#003856] transition-all hover:bg-[#faf9f7] active:scale-95 print:hidden"
          >
            <Printer className="h-4 w-4" />
            Als PDF exportieren
          </button>
        }
      />

      {/* Inputs */}
      <div className={`${CARD} mb-6 print:hidden`}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Ihre Eckdaten</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={LABEL}>Rechnungen pro Monat</label>
            <input type="number" value={inputs.rechnungen} onChange={(e) => set({ rechnungen: Number(e.target.value) })} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>⌀ Minuten pro Rechnung (manuell)</label>
            <input type="number" value={inputs.minManuell} onChange={(e) => set({ minManuell: Number(e.target.value) })} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Stundensatz Sachbearbeiter (€)</label>
            <input type="number" value={inputs.stundensatz} onChange={(e) => set({ stundensatz: Number(e.target.value) })} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Fehlerquote manuell (%)</label>
            <input type="number" value={inputs.fehlerManuell} onChange={(e) => set({ fehlerManuell: Number(e.target.value) })} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>⌀ Kosten pro Fehler (€)</label>
            <input type="number" value={inputs.kostenProFehler} onChange={(e) => set({ kostenProFehler: Number(e.target.value) })} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Lizenzkosten / Monat (€)</label>
            <input type="number" value={inputs.lizenzMonat} onChange={(e) => set({ lizenzMonat: Number(e.target.value) })} className={INPUT} />
          </div>
        </div>
      </div>

      {/* Ergebnis-Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResultCard
          icon={Clock}
          label="Zeitersparnis"
          value={<><CountUp value={Math.round(calc.zeitStd)} /> Std/Jahr</>}
          sub={`↓ ${Math.round(calc.prozentSchneller)}% schneller`}
        />
        <ResultCard
          icon={Wallet}
          label="Kostenersparnis"
          value={<CountUp value={Math.round(calc.gesamt)} format={(n) => eur(n)} />}
          sub={`ROI: ${Math.round(calc.roi)}%`}
        />
        <ResultCard
          icon={ShieldAlert}
          label="Fehlervermeidung"
          value={<><CountUp value={Math.round(calc.fehlerVermeidung)} /> /Jahr</>}
          sub="weniger Fehler"
        />
      </div>

      {/* Formel */}
      <button
        onClick={() => setShowFormula((s) => !s)}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#003856] transition hover:underline print:hidden"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${showFormula ? "rotate-180" : ""}`} />
        Berechnungsformel anzeigen
      </button>
      {showFormula && (
        <div className={`${CARD} mt-3`}>
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#64748b]">
{`Zeitersparnis (Std/Jahr) = Rechnungen × (manuell_min − ${AUTO_MIN}) / 60 × 12
Kostenersparnis          = Zeitersparnis × Stundensatz
Fehlervermeidung         = Rechnungen × (fehlerquote_manuell − ${FEHLER_AUTO}%) × 12
Fehlerkostenvermeidung   = Fehlervermeidung × Kosten_pro_Fehler
Gesamtersparnis          = Kostenersparnis + Fehlerkostenvermeidung
ROI                      = (Gesamtersparnis − Lizenzkosten) / Lizenzkosten × 100

Annahmen: Auto-Bearbeitung ${AUTO_MIN} Min/Rechnung, Auto-Fehlerquote ${FEHLER_AUTO}%.`}
          </pre>
        </div>
      )}

      {/* Amortisation */}
      <div className={`${CARD} mt-6`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1a1a2e]">Amortisation (12 Monate)</h2>
          {calc.breakEven && calc.breakEven <= 12 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              Break-Even: Monat {calc.breakEven}
            </span>
          )}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="roiArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ede7df" vertical={false} />
              <XAxis dataKey="monat" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={{ stroke: "#e7e0d6" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={52}
                tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e7e0d6", fontSize: 12 }}
                formatter={(v: number, n) => [eur(v), n === "ersparnis" ? "Kum. Ersparnis" : "Lizenzkosten/Jahr"]}
              />
              <Area type="monotone" dataKey="ersparnis" stroke="#059669" strokeWidth={2.5} fill="url(#roiArea)" />
              <Line type="monotone" dataKey="lizenz" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 4" dot={false} />
              {calc.breakEven && calc.breakEven <= 12 && (
                <ReferenceLine x={`M${calc.breakEven}`} stroke="#003856" strokeDasharray="3 3" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#64748b]">
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#059669]" />Kumulierte Ersparnis</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-[#dc2626]" />Lizenzkosten/Jahr</span>
        </div>
      </div>

      {/* Vergleichstabelle */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-[#1a1a2e]">Vorher vs. Nachher</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-[rgba(0,56,86,0.06)] text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
                <th className="px-6 py-3">Metrik</th>
                <th className="px-6 py-3">Manuell</th>
                <th className="px-6 py-3 text-[#003856]">FlowCheck AI+</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
              {[
                ["Bearbeitungszeit", `${inputs.minManuell} Min`, "45 Sek"],
                ["Fehlerquote", `${inputs.fehlerManuell}%`, `${FEHLER_AUTO}%`],
                ["Kosten pro Rechnung", eur(kostenManuell), eur(kostenAuto)],
                ["DATEV-Export", "~30 Min", "1 Klick"],
                ["Compliance-Prüfung", "Manuell", "Automatisch"],
              ].map(([m, a, b]) => (
                <tr key={m} className="transition hover:bg-[#faf9f7]">
                  <td className="px-6 py-3.5 font-medium text-[#1a1a2e]">{m}</td>
                  <td className="px-6 py-3.5 text-[#64748b]">{a}</td>
                  <td className="px-6 py-3.5 font-semibold text-emerald-700">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-[#94a3b8]">
        Berechnung auf Basis Ihrer Eingaben. Automatisierungs-Annahmen ({AUTO_MIN} Min/Rechnung, {FEHLER_AUTO}% Fehlerquote)
        sind Richtwerte und können je nach Belegtyp abweichen. {num(inputs.rechnungen)} Rechnungen/Monat zugrunde gelegt.
      </p>
    </div>
  );
}
