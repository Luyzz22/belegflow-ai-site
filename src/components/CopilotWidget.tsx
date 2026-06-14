"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Send, Minus } from "lucide-react";
import {
  flowcheckApi,
  type InvoiceListItem,
  type Lieferant,
  type DashboardKpis,
} from "@/lib/api-client";
import { eur, num, dateDE } from "@/lib/format";
import { isPaid } from "@/lib/payments";
import { zahlungszielFor } from "@/lib/stammdaten";

interface Cta {
  label: string;
  href: string;
}
interface Msg {
  role: "user" | "bot";
  text: string;
  lines?: string[];
  cta?: Cta;
}

const SUGGESTIONS = [
  { chip: "📊 Status-Übersicht", q: "status übersicht" },
  { chip: "💰 Offene Rechnungen", q: "welche rechnungen sind offen?" },
  { chip: "📈 Monatsvergleich", q: "wie viele rechnungen diesen monat?" },
];

const DAY = 86_400_000;

function answer(
  q: string,
  data: { invoices: InvoiceListItem[]; lieferanten: Lieferant[]; kpis: DashboardKpis | null }
): Msg {
  const s = q.toLowerCase();
  const { invoices, lieferanten, kpis } = data;
  const now = Date.now();

  const monthKey = new Date(now).toISOString().slice(0, 7);
  const thisMonth = invoices.filter((i) => (i.datum || i.created_at || "").slice(0, 7) === monthKey);

  // Lieferant in der Frage?
  const lief = lieferanten.find((l) => l.name && s.includes(l.name.toLowerCase()));
  if (lief && (s.includes("ausgabe") || s.includes("lieferant") || s.includes("bei "))) {
    return {
      role: "bot",
      text: `Gesamtausgaben bei ${lief.name}: ${eur(lief.gesamtvolumen)} (${num(lief.anzahl_rechnungen)} Rechnungen). Durchschnitt: ${eur(lief.durchschnitt)} pro Rechnung.`,
      cta: { label: "Lieferant ansehen", href: `/lieferanten/${encodeURIComponent(lief.name)}` },
    };
  }

  if (s.includes("überfäll") || s.includes("ueberfaell") || s.includes("faellig") || s.includes("fällig")) {
    const overdue = invoices.filter((i) => {
      if (isPaid(i.id)) return false;
      const base = Date.parse(i.datum || i.created_at || "");
      if (!Number.isFinite(base)) return false;
      const due = base + zahlungszielFor(i.lieferant) * DAY;
      return due < now;
    });
    if (overdue.length === 0)
      return { role: "bot", text: "Aktuell sind keine Rechnungen überfällig. 👍" };
    return {
      role: "bot",
      text: `${overdue.length} Rechnung(en) sind überfällig:`,
      lines: overdue.slice(0, 5).map((i) => `• ${i.rechnungsnummer || `#${i.id}`} (${i.lieferant}, ${eur(i.betrag, i.waehrung)})`),
      cta: { label: "Zahlungen öffnen", href: "/zahlungen" },
    };
  }

  if (s.includes("offen") || (s.includes("freigabe") && !s.includes("zeit"))) {
    const open = invoices.filter((i) => (i.status || "").toLowerCase() === "verarbeitet");
    if (open.length === 0) return { role: "bot", text: "Es warten keine Rechnungen auf Freigabe. Alles erledigt! ✅" };
    return {
      role: "bot",
      text: `${open.length} Rechnung(en) warten auf Freigabe:`,
      lines: open.slice(0, 5).map((i) => `• ${i.rechnungsnummer || `#${i.id}`} (${i.lieferant}, ${eur(i.betrag, i.waehrung)})`),
      cta: { label: "Review starten", href: "/review" },
    };
  }

  if (s.includes("größte") || s.includes("groesste") || s.includes("höchste") || s.includes("teuerste")) {
    if (invoices.length === 0) return { role: "bot", text: "Es liegen noch keine Rechnungen vor." };
    const max = invoices.reduce((a, b) => ((b.betrag || 0) > (a.betrag || 0) ? b : a));
    return {
      role: "bot",
      text: `Die größte Rechnung ist ${max.rechnungsnummer || `#${max.id}`} von ${max.lieferant} über ${eur(max.betrag, max.waehrung)} (${dateDE(max.datum)}).`,
      cta: { label: "Details ansehen", href: `/rechnungen/${max.id}` },
    };
  }

  if (s.includes("datev") || s.includes("export")) {
    const ready = invoices.filter((i) => (i.status || "").toLowerCase() === "freigegeben");
    return {
      role: "bot",
      text:
        ready.length > 0
          ? `${ready.length} Rechnung(en) sind exportbereit.`
          : "Aktuell sind keine freigegebenen Rechnungen exportbereit.",
      cta: { label: "Zum DATEV-Export", href: "/export" },
    };
  }

  if (s.includes("spare") || s.includes("ersparnis") || s.includes("roi")) {
    let minManuell = 8;
    let stundensatz = 45;
    try {
      const raw = localStorage.getItem("flowcheck_roi");
      if (raw) {
        const r = JSON.parse(raw);
        minManuell = r.minManuell ?? 8;
        stundensatz = r.stundensatz ?? 45;
      }
    } catch {
      /* defaults */
    }
    const rechnungen = kpis?.rechnungen_monat ?? thisMonth.length;
    const std = (rechnungen * (minManuell - 0.75) * 12) / 60;
    const kosten = std * stundensatz;
    return {
      role: "bot",
      text: `Basierend auf Ihren Daten sparen Sie geschätzt ${eur(kosten)} pro Jahr und ${Math.round(std)} Stunden Bearbeitungszeit.`,
      cta: { label: "ROI-Details", href: "/roi" },
    };
  }

  if (s.includes("wie viele") || s.includes("diesen monat") || s.includes("status") || s.includes("übersicht") || s.includes("monat")) {
    const vol = thisMonth.reduce((sum, i) => sum + (i.betrag || 0), 0);
    return {
      role: "bot",
      text: `Diesen Monat wurden ${num(thisMonth.length)} Rechnungen verarbeitet mit einem Gesamtvolumen von ${eur(vol)}. Automatisierungsquote: ${Math.round(kpis?.automatisierungsquote ?? 0)}%.`,
      cta: { label: "Zum Dashboard", href: "/dashboard" },
    };
  }

  return {
    role: "bot",
    text:
      "Das kann ich leider noch nicht beantworten. Versuchen Sie z. B.: „Wie viele Rechnungen haben wir?“, „Welche Rechnungen sind offen?“ oder „Zeig mir die größte Rechnung“.",
  };
}

export default function CopilotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hallo! Ich bin Ihr FlowCheck Copilot ✨ — fragen Sie mich etwas zu Ihren Rechnungen.",
      cta: { label: "Brauchen Sie Hilfe? Hilfe-Center öffnen", href: "/hilfe" },
    },
  ]);
  const dataRef = useRef<{ invoices: InvoiceListItem[]; lieferanten: Lieferant[]; kpis: DashboardKpis | null }>({
    invoices: [],
    lieferanten: [],
    kpis: null,
  });
  const loadedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Daten beim ersten Öffnen laden.
  useEffect(() => {
    if (!open || loadedRef.current) return;
    loadedRef.current = true;
    flowcheckApi.invoices("limit=100&offset=0").then((r) => (dataRef.current.invoices = r.items || [])).catch(() => {});
    flowcheckApi.lieferanten().then((r) => (dataRef.current.lieferanten = r.items || [])).catch(() => {});
    flowcheckApi.kpis().then((k) => (dataRef.current.kpis = k)).catch(() => {});
  }, [open]);

  // Autoscroll.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing, open]);

  const ask = useCallback((q: string) => {
    if (!q.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      const a = answer(q, dataRef.current);
      setTyping(false);
      setMessages((prev) => [...prev, a]);
    }, 500);
  }, []);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Finance Copilot öffnen"
          className="fixed bottom-5 right-16 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#003856] text-white shadow-xl transition-all hover:bg-[#002a42] hover:scale-105 active:scale-95 print:hidden"
        >
          <Sparkles className="h-6 w-6 text-[#ffb900]" />
        </button>
      )}

      {open && (
        <div className="fc-sheet-up fixed bottom-5 right-5 z-50 flex h-[500px] max-h-[70vh] w-[calc(100vw-2.5rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl print:hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#003856] px-4 py-3 text-white">
            <span className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-5 w-5 text-[#ffb900]" />
              FlowCheck Copilot
            </span>
            <button onClick={() => setOpen(false)} aria-label="Minimieren" className="rounded-lg p-1 transition hover:bg-white/10">
              <Minus className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-white p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.role === "user"
                      ? "rounded-br-md bg-[#003856] text-white"
                      : "rounded-bl-md bg-[#f8f6f3] text-[#1a1a2e]"
                  }`}
                >
                  <p>{m.text}</p>
                  {m.lines && (
                    <ul className="mt-1.5 space-y-0.5 text-xs">
                      {m.lines.map((l, j) => (
                        <li key={j}>{l}</li>
                      ))}
                    </ul>
                  )}
                  {m.cta && (
                    <Link
                      href={m.cta.href}
                      onClick={() => setOpen(false)}
                      className="mt-2 inline-block rounded-lg bg-white/0 text-xs font-semibold text-[#003856] underline-offset-2 hover:underline"
                    >
                      {m.cta.label} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-md bg-[#f8f6f3] px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#94a3b8] [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#94a3b8] [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#94a3b8]" />
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 border-t border-stone-100 px-4 py-3">
              {SUGGESTIONS.map((su) => (
                <button
                  key={su.chip}
                  onClick={() => ask(su.q)}
                  className="rounded-full border border-[#003856] px-3 py-1 text-xs font-medium text-[#003856] transition hover:bg-[#003856]/5 active:scale-95"
                >
                  {su.chip}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 border-t border-stone-200 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Fragen Sie Ihren Finance Copilot …"
              className="flex-1 rounded-xl border border-[rgba(0,56,86,0.12)] px-3 py-2 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
            />
            <button
              type="submit"
              aria-label="Senden"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#003856] text-white transition hover:bg-[#002a42] active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
