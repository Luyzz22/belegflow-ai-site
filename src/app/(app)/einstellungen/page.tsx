"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Calculator, Bell, Palette, Save, Link2, Copy, RefreshCw, Power } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Toggle from "@/components/Toggle";
import StammdatenPanel from "@/components/StammdatenPanel";
import { useToast } from "@/components/toast/ToastProvider";

type SettingsTab = "allgemein" | "konten" | "kostenstellen" | "lieferanten";

const TABS: { value: SettingsTab; label: string }[] = [
  { value: "allgemein", label: "Allgemein" },
  { value: "konten", label: "Kontenplan" },
  { value: "kostenstellen", label: "Kostenstellen" },
  { value: "lieferanten", label: "Lieferanten-Stammdaten" },
];
import {
  loadSettings,
  saveSettings,
  type AppSettings,
  type Kontenrahmen,
  type Waehrung,
  type Datumsformat,
} from "@/lib/settings";

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";
const INPUT =
  "w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20";
const LABEL = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#64748b]";

function SectionHeader({ icon: Icon, title }: { icon: typeof ShieldCheck; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003856]/5 text-[#003856]">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="text-xl font-semibold text-[#1a1a2e]">{title}</h2>
    </div>
  );
}

function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
    >
      <Save className="h-4 w-4" />
      Speichern
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 border-b border-[rgba(0,56,86,0.06)] py-3 last:border-0">
      <span className="text-sm text-[#1a1a2e]">{label}</span>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </label>
  );
}

export default function EinstellungenPage() {
  const { addToast } = useToast();
  const [s, setS] = useState<AppSettings>(() => loadSettings());
  const [tab, setTab] = useState<SettingsTab>("allgemein");
  const [portalToken, setPortalToken] = useState<string>("");

  useEffect(() => {
    Promise.resolve().then(() => {
      let t = localStorage.getItem("flowcheck_portal_token");
      if (!t) {
        t = Math.random().toString(36).slice(2, 12);
        localStorage.setItem("flowcheck_portal_token", t);
      }
      setPortalToken(t);
    });
  }, []);

  const portalLink = portalToken && typeof window !== "undefined" ? `${window.location.origin}/portal/${portalToken}` : "";

  const regeneratePortal = () => {
    const t = Math.random().toString(36).slice(2, 12);
    localStorage.setItem("flowcheck_portal_token", t);
    setPortalToken(t);
    addToast({ type: "success", text: "Neuer Portal-Link generiert" });
  };
  const deactivatePortal = () => {
    localStorage.removeItem("flowcheck_portal_token");
    setPortalToken("");
    addToast({ type: "info", text: "Portal deaktiviert" });
  };
  const copyPortal = () => {
    navigator.clipboard?.writeText(portalLink).then(
      () => addToast({ type: "success", text: "Portal-Link kopiert" }),
      () => addToast({ type: "error", text: "Kopieren fehlgeschlagen" })
    );
  };

  const persist = (section: string) => {
    saveSettings(s);
    addToast({ type: "success", text: `${section} gespeichert` });
  };

  const setFreigabe = (patch: Partial<AppSettings["freigabe"]>) =>
    setS((p) => ({ ...p, freigabe: { ...p.freigabe, ...patch } }));
  const setKontierung = (patch: Partial<AppSettings["kontierung"]>) =>
    setS((p) => ({ ...p, kontierung: { ...p.kontierung, ...patch } }));
  const setBenach = (patch: Partial<AppSettings["benachrichtigungen"]>) =>
    setS((p) => ({ ...p, benachrichtigungen: { ...p.benachrichtigungen, ...patch } }));
  const setDarstellung = (patch: Partial<AppSettings["darstellung"]>) =>
    setS((p) => ({ ...p, darstellung: { ...p.darstellung, ...patch } }));

  return (
    <div className="fc-fade-in">
      <PageHeader title="Einstellungen" description="Konfiguration, Stammdaten und Darstellung" />

      {/* Tab-Leiste */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition active:scale-95 ${
              tab === t.value
                ? "bg-[#003856] text-white"
                : "bg-white text-[#64748b] ring-1 ring-[rgba(0,56,86,0.12)] hover:bg-[#faf9f7] hover:text-[#003856]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "konten" && <StammdatenPanel which="konten" />}
      {tab === "kostenstellen" && <StammdatenPanel which="kostenstellen" />}
      {tab === "lieferanten" && <StammdatenPanel which="lieferanten" />}

      {tab === "allgemein" && (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Freigabe-Regeln */}
        <section className={CARD}>
          <SectionHeader icon={ShieldCheck} title="Freigabe-Regeln" />
          <p className="mb-4 text-sm text-[#64748b]">Betragsgrenzen für die mehrstufige Freigabe.</p>
          <div className="space-y-4">
            <div>
              <label className={LABEL}>Stufe 1 — Sachbearbeiter bis (€)</label>
              <input
                type="number"
                value={s.freigabe.stufe1}
                onChange={(e) => setFreigabe({ stufe1: Number(e.target.value) })}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Stufe 2 — Teamleiter bis (€)</label>
              <input
                type="number"
                value={s.freigabe.stufe2}
                onChange={(e) => setFreigabe({ stufe2: Number(e.target.value) })}
                className={INPUT}
              />
            </div>
            <p className="text-sm text-[#64748b]">
              Über {s.freigabe.stufe2.toLocaleString("de-DE")} € → Geschäftsführung
            </p>
            <div className="flex items-center justify-between gap-4 rounded-xl bg-[#faf9f7] px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#1a1a2e]">Automatische Freigabe</p>
                <p className="text-xs text-[#64748b]">Rechnungen unterhalb der Grenze automatisch freigeben.</p>
              </div>
              <Toggle
                checked={s.freigabe.autoEnabled}
                onChange={(v) => setFreigabe({ autoEnabled: v })}
                label="Automatische Freigabe"
              />
            </div>
            {s.freigabe.autoEnabled && (
              <div>
                <label className={LABEL}>Automatisch freigeben unter (€)</label>
                <input
                  type="number"
                  value={s.freigabe.autoUnder}
                  onChange={(e) => setFreigabe({ autoUnder: Number(e.target.value) })}
                  className={INPUT}
                />
              </div>
            )}
          </div>
          <SaveButton onClick={() => persist("Freigabe-Regeln")} />
        </section>

        {/* Kontierung */}
        <section className={CARD}>
          <SectionHeader icon={Calculator} title="Kontierung" />
          <div className="space-y-4">
            <div>
              <label className={LABEL}>Standard-Konto</label>
              <input
                value={s.kontierung.konto}
                onChange={(e) => setKontierung({ konto: e.target.value })}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Standard-Gegenkonto</label>
              <input
                value={s.kontierung.gegenkonto}
                onChange={(e) => setKontierung({ gegenkonto: e.target.value })}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Kontenrahmen</label>
              <div className="flex gap-2">
                {(["SKR03", "SKR04"] as Kontenrahmen[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setKontierung({ kontenrahmen: k })}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all active:scale-95 ${
                      s.kontierung.kontenrahmen === k
                        ? "bg-[#003856] text-white"
                        : "border border-[rgba(0,56,86,0.12)] bg-[#faf9f7] text-[#64748b] hover:bg-[#003856]/5"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <SaveButton onClick={() => persist("Kontierung")} />
        </section>

        {/* Benachrichtigungen */}
        <section className={CARD}>
          <SectionHeader icon={Bell} title="Benachrichtigungen" />
          <div>
            <ToggleRow
              label="E-Mail bei neuen Rechnungen"
              checked={s.benachrichtigungen.neueRechnungen}
              onChange={(v) => setBenach({ neueRechnungen: v })}
            />
            <ToggleRow
              label="E-Mail bei Anomalien"
              checked={s.benachrichtigungen.anomalien}
              onChange={(v) => setBenach({ anomalien: v })}
            />
            <ToggleRow
              label="Tägliche Zusammenfassung"
              checked={s.benachrichtigungen.taeglich}
              onChange={(v) => setBenach({ taeglich: v })}
            />
          </div>
          <SaveButton onClick={() => persist("Benachrichtigungen")} />
        </section>

        {/* Darstellung */}
        <section className={CARD}>
          <SectionHeader icon={Palette} title="Darstellung" />
          <div className="space-y-4">
            <div>
              <label className={LABEL}>Währungsformat</label>
              <div className="flex gap-2">
                {(["EUR", "CHF", "USD"] as Waehrung[]).map((w) => (
                  <button
                    key={w}
                    onClick={() => setDarstellung({ waehrung: w })}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all active:scale-95 ${
                      s.darstellung.waehrung === w
                        ? "bg-[#003856] text-white"
                        : "border border-[rgba(0,56,86,0.12)] bg-[#faf9f7] text-[#64748b] hover:bg-[#003856]/5"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={LABEL}>Datumsformat</label>
              <div className="flex gap-2">
                {(["DD.MM.YYYY", "YYYY-MM-DD"] as Datumsformat[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDarstellung({ datumsformat: d })}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all active:scale-95 ${
                      s.darstellung.datumsformat === d
                        ? "bg-[#003856] text-white"
                        : "border border-[rgba(0,56,86,0.12)] bg-[#faf9f7] text-[#64748b] hover:bg-[#003856]/5"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={LABEL}>Sprache</label>
              <div className="flex items-center justify-between rounded-xl border border-[rgba(0,56,86,0.12)] bg-[#faf9f7] px-4 py-2.5 text-sm text-[#64748b]">
                Deutsch
                <span className="text-xs">gesperrt</span>
              </div>
            </div>
          </div>
          <SaveButton onClick={() => persist("Darstellung")} />
        </section>

        {/* Lieferanten-Portal */}
        <section className={`${CARD} lg:col-span-2`}>
          <SectionHeader icon={Link2} title="Lieferanten-Portal" />
          <p className="mb-4 text-sm text-[#64748b]">
            Teilen Sie diesen Link mit Ihren Lieferanten. Eingereichte Rechnungen werden automatisch verarbeitet.
          </p>
          {portalToken ? (
            <>
              <div className="flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] bg-[#faf9f7] px-3 py-2.5">
                <Link2 className="h-4 w-4 shrink-0 text-[#64748b]" />
                <code className="flex-1 truncate font-mono text-xs text-[#1a1a2e]">{portalLink}</code>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={copyPortal} className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95">
                  <Copy className="h-4 w-4" /> Link kopieren
                </button>
                <button onClick={regeneratePortal} className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2 text-sm font-medium text-[#003856] transition-all hover:bg-[#faf9f7] active:scale-95">
                  <RefreshCw className="h-4 w-4" /> Neuen Link generieren
                </button>
                <button onClick={deactivatePortal} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 active:scale-95">
                  <Power className="h-4 w-4" /> Portal deaktivieren
                </button>
              </div>
            </>
          ) : (
            <button onClick={regeneratePortal} className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95">
              <Power className="h-4 w-4" /> Portal aktivieren
            </button>
          )}
        </section>
      </div>
      )}
    </div>
  );
}
