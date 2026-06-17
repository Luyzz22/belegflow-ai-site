"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, Plus, X, Eye, Save } from "lucide-react";
import Toggle from "@/components/Toggle";
import { useToast } from "@/components/toast/ToastProvider";

type EventKey =
  | "neueRechnung"
  | "freigegeben"
  | "anomalie"
  | "datevExport"
  | "taeglich"
  | "woechentlich";

interface EmailSettings {
  events: Record<EventKey, boolean>;
  email: string;
  recipients: string[];
}

const EVENTS: { key: EventKey; label: string }[] = [
  { key: "neueRechnung", label: "Neue Rechnung verarbeitet → E-Mail" },
  { key: "freigegeben", label: "Rechnung freigegeben → E-Mail" },
  { key: "anomalie", label: "Anomalie erkannt → E-Mail an Geschäftsführung" },
  { key: "datevExport", label: "DATEV-Export durchgeführt → E-Mail" },
  { key: "taeglich", label: "Tägliche Zusammenfassung (09:00 Uhr)" },
  { key: "woechentlich", label: "Wöchentlicher Report (Montag 09:00 Uhr)" },
];

const DEFAULTS: EmailSettings = {
  events: {
    neueRechnung: false,
    freigegeben: false,
    anomalie: false,
    datevExport: false,
    taeglich: false,
    woechentlich: false,
  },
  email: "ki@sbsdeutschland.de",
  recipients: [],
};

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

function load(): EmailSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem("fc_email_notifications");
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<EmailSettings>;
    return {
      events: { ...DEFAULTS.events, ...parsed.events },
      email: parsed.email || DEFAULTS.email,
      recipients: parsed.recipients || [],
    };
  } catch {
    return DEFAULTS;
  }
}

function EmailPreview({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm print:hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="E-Mail-Vorschau"
    >
      <div className="w-full max-w-[600px]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex justify-end">
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Vorschau schließen"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-[#003856] transition hover:bg-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* E-Mail-Mock */}
        <div className="overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10">
          <div className="bg-[#003856] px-6 py-4 text-white">
            <span className="text-lg font-semibold">
              FlowCheck <span className="text-[#c8985a]">AI+</span>
            </span>
          </div>
          <div className="px-6 py-6">
            <h3 className="text-lg font-semibold text-[#1a1a2e]">Neue Rechnung verarbeitet</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#64748b]">
              Rechnung RE-2026-001 von Müller &amp; Brandt wurde erfolgreich verarbeitet.
            </p>
            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#94a3b8]">Betrag</dt>
                <dd className="font-medium text-[#1a1a2e]">7.931,35 €</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#94a3b8]">KI-Konfidenz</dt>
                <dd className="font-medium text-[#1a1a2e]">97 %</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#94a3b8]">Status</dt>
                <dd className="font-medium text-emerald-700">Bereit zur Freigabe</dd>
              </div>
            </dl>
            <div className="mt-6">
              <span className="inline-block rounded-lg bg-[#FFB900] px-5 py-2.5 text-sm font-semibold text-[#003856]">
                Im Dashboard ansehen →
              </span>
            </div>
          </div>
          <div className="border-t border-stone-100 bg-[#faf9f7] px-6 py-4 text-xs text-[#94a3b8]">
            SBS Deutschland GmbH &amp; Co. KG · In der Dell 19 · 69469 Weinheim
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailNotificationsPanel() {
  const { addToast } = useToast();
  const [s, setS] = useState<EmailSettings>(DEFAULTS);
  const [newRecipient, setNewRecipient] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const loaded = load();
    Promise.resolve().then(() => setS(loaded));
  }, []);

  const persist = (next: EmailSettings) => {
    setS(next);
    if (typeof window !== "undefined") localStorage.setItem("fc_email_notifications", JSON.stringify(next));
  };

  const toggle = (key: EventKey, v: boolean) => persist({ ...s, events: { ...s.events, [key]: v } });

  const addRecipient = () => {
    const r = newRecipient.trim();
    if (!r.includes("@") || s.recipients.includes(r)) return;
    persist({ ...s, recipients: [...s.recipients, r] });
    setNewRecipient("");
  };

  const removeRecipient = (r: string) => persist({ ...s, recipients: s.recipients.filter((x) => x !== r) });

  const save = () => {
    persist(s);
    addToast({ type: "success", text: "Benachrichtigungs-Einstellungen gespeichert" });
  };

  return (
    <section className={`${CARD} lg:col-span-2`}>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003856]/5 text-[#003856]">
          <Mail className="h-5 w-5" />
        </span>
        <h2 className="text-xl font-semibold text-[#1a1a2e]">E-Mail-Benachrichtigungen</h2>
      </div>

      <div>
        {EVENTS.map((e) => (
          <label key={e.key} className="flex items-center justify-between gap-4 border-b border-[rgba(0,56,86,0.06)] py-3 last:border-0">
            <span className="text-sm text-[#1a1a2e]">{e.label}</span>
            <Toggle checked={s.events[e.key]} onChange={(v) => toggle(e.key, v)} label={e.label} />
          </label>
        ))}
      </div>

      {/* E-Mail-Adresse */}
      <div className="mt-5">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[#64748b]">E-Mail-Adresse</p>
        {editingEmail ? (
          <div className="flex gap-2">
            <input
              type="email"
              value={s.email}
              onChange={(ev) => setS({ ...s, email: ev.target.value })}
              className="flex-1 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
            />
            <button
              onClick={() => {
                persist(s);
                setEditingEmail(false);
              }}
              className="rounded-xl bg-[#003856] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002a42] active:scale-95"
            >
              Übernehmen
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-[#faf9f7] px-4 py-2.5">
            <span className="text-sm text-[#1a1a2e]">{s.email}</span>
            <button onClick={() => setEditingEmail(true)} className="text-sm font-medium text-[#003856] hover:underline">
              Ändern
            </button>
          </div>
        )}
      </div>

      {/* Zusätzliche Empfänger */}
      <div className="mt-4">
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[#64748b]">Zusätzliche Empfänger</p>
        {s.recipients.length > 0 && (
          <ul className="mb-2 space-y-1.5">
            {s.recipients.map((r) => (
              <li key={r} className="flex items-center justify-between gap-2 rounded-lg bg-[#faf9f7] px-3 py-2 text-sm">
                <span className="text-[#1a1a2e]">{r}</span>
                <button onClick={() => removeRecipient(r)} aria-label={`${r} entfernen`} className="rounded p-0.5 text-[#64748b] transition hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input
            type="email"
            value={newRecipient}
            onChange={(ev) => setNewRecipient(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                ev.preventDefault();
                addRecipient();
              }
            }}
            placeholder="weitere@firma.de"
            className="flex-1 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
          />
          <button onClick={addRecipient} className="inline-flex items-center gap-1.5 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2 text-sm font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95">
            <Plus className="h-4 w-4" /> Empfänger hinzufügen
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[rgba(0,56,86,0.1)] bg-[#faf9f7] p-3.5 text-xs text-[#64748b]">
        Hinweis: E-Mail-Benachrichtigungen werden in einer kommenden Version aktiviert. Ihre Einstellungen werden gespeichert.
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95">
          <Save className="h-4 w-4" /> Speichern
        </button>
        <button onClick={() => setShowPreview(true)} className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] px-5 py-2.5 text-sm font-medium text-[#003856] transition hover:bg-[#faf9f7] active:scale-95">
          <Eye className="h-4 w-4" /> E-Mail-Vorschau
        </button>
      </div>

      {showPreview && <EmailPreview onClose={() => setShowPreview(false)} />}
    </section>
  );
}
