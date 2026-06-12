"use client";

import { useState } from "react";
import { LogOut, Pencil, Save, KeyRound, Copy, Check, Camera } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import { LoadingState } from "@/components/States";
import { useToast } from "@/components/toast/ToastProvider";

function roleLabel(role?: string) {
  const map: Record<string, string> = {
    admin: "Administrator",
    user: "Benutzer",
    buchhalter: "Buchhaltung",
    freigeber: "Freigeber",
    viewer: "Leser",
  };
  return (role && map[role]) || role || "Benutzer";
}

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";
const INPUT =
  "w-full rounded-xl border border-[rgba(0,56,86,0.12)] px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20";
const LABEL = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#64748b]";

function memberSince(): string {
  if (typeof window === "undefined") return "—";
  let d = localStorage.getItem("flowcheck_member_since");
  if (!d) {
    d = new Date().toISOString();
    localStorage.setItem("flowcheck_member_since", d);
  }
  return new Date(d).toLocaleDateString("de-DE", { year: "numeric", month: "long" });
}

export default function ProfilPage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [copied, setCopied] = useState(false);

  if (!user) return <LoadingState />;

  const displayName = name || user.name || "";
  const initials = (displayName || user.email || "?").slice(0, 1).toUpperCase();
  const apiKey = "fck_live_" + "••••••••••••••••••••" + String(user.id).padStart(4, "0");

  const startEditName = () => {
    setName(user.name || "");
    setEditingName(true);
  };
  const saveName = () => {
    try {
      const raw = localStorage.getItem("flowcheck_user");
      const obj = raw ? JSON.parse(raw) : {};
      obj.name = name.trim();
      localStorage.setItem("flowcheck_user", JSON.stringify(obj));
    } catch {
      /* ignore */
    }
    setEditingName(false);
    addToast({ type: "success", text: "Name aktualisiert" });
  };

  const changePassword = () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      addToast({ type: "warning", text: "Bitte alle Felder ausfüllen." });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      addToast({ type: "error", text: "Die neuen Passwörter stimmen nicht überein." });
      return;
    }
    // Hinweis: Kein Backend-Endpoint — wird aktuell nicht persistiert.
    addToast({ type: "info", text: "Passwortänderung ist noch nicht verfügbar." });
    setPwForm({ current: "", next: "", confirm: "" });
  };

  const copyKey = () => {
    navigator.clipboard?.writeText(apiKey).then(
      () => {
        setCopied(true);
        addToast({ type: "success", text: "API-Schlüssel kopiert" });
        setTimeout(() => setCopied(false), 1500);
      },
      () => addToast({ type: "error", text: "Kopieren fehlgeschlagen" })
    );
  };

  return (
    <div className="fc-fade-in">
      <PageHeader title="Profil" description="Ihre Kontodaten und Integrationen" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Avatar-Karte */}
        <div className={CARD}>
          <div className="flex flex-col items-center text-center">
            <button
              onClick={() => addToast({ type: "info", text: "Avatar-Upload ist noch nicht verfügbar." })}
              className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-[#003856] text-2xl font-semibold text-white transition hover:opacity-90"
              aria-label="Avatar ändern"
            >
              {initials}
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
                <Camera className="h-5 w-5" />
              </span>
            </button>
            <p className="mt-4 text-lg font-semibold text-[#1a1a2e]">{displayName || "—"}</p>
            <p className="text-sm text-[#64748b]">{user.email}</p>
            <span className="mt-3 rounded-lg bg-[#c8985a]/15 px-2.5 py-1 text-xs font-semibold text-[#8a6526]">
              {roleLabel(user.role)}
            </span>
            <p className="mt-4 text-xs text-[#94a3b8]">Seit {memberSince()} bei FlowCheck AI+</p>
          </div>
        </div>

        {/* Kontodetails */}
        <div className={`${CARD} lg:col-span-2`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#1a1a2e]">Kontodetails</h2>
            {!editingName && (
              <button
                onClick={startEditName}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-[#003856] transition hover:bg-[#003856]/5 active:scale-95"
              >
                <Pencil className="h-4 w-4" />
                Name bearbeiten
              </button>
            )}
          </div>

          {editingName ? (
            <div className="mb-2">
              <label className={LABEL}>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} autoFocus className={INPUT} />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={saveName}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
                >
                  <Save className="h-4 w-4" />
                  Speichern
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#64748b] transition hover:bg-[#faf9f7] active:scale-95"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <dl className="divide-y divide-[rgba(0,56,86,0.06)]">
              {[
                ["Name", displayName || "—"],
                ["E-Mail", user.email],
                ["Rolle", roleLabel(user.role)],
                ["Benutzer-ID", String(user.id)],
                ["Mandant", user.tenant_id || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <dt className="text-xs font-medium uppercase tracking-wider text-[#64748b]">{label}</dt>
                  <dd className="text-sm font-medium text-[#1a1a2e]">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-6 border-t border-[rgba(0,56,86,0.06)] pt-5">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 font-medium text-red-600 transition-all hover:bg-red-50 active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </button>
          </div>
        </div>

        {/* Passwort ändern */}
        <div className={`${CARD} lg:col-span-2`}>
          <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">Passwort ändern</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={LABEL}>Aktuelles Passwort</label>
              <input
                type="password"
                value={pwForm.current}
                onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Neues Passwort</label>
              <input
                type="password"
                value={pwForm.next}
                onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Bestätigen</label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                className={INPUT}
              />
            </div>
          </div>
          <button
            onClick={changePassword}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#003856] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#002a42] active:scale-95"
          >
            <KeyRound className="h-4 w-4" />
            Passwort ändern
          </button>
        </div>

        {/* API-Schlüssel */}
        <div className={CARD}>
          <h2 className="mb-1 text-xl font-semibold text-[#1a1a2e]">API-Schlüssel</h2>
          <p className="mb-4 text-sm text-[#64748b]">Ihr Schlüssel für Integrationen.</p>
          <div className="flex items-center gap-2 rounded-xl border border-[rgba(0,56,86,0.12)] bg-[#faf9f7] px-3 py-2.5">
            <KeyRound className="h-4 w-4 shrink-0 text-[#64748b]" />
            <code className="flex-1 truncate font-mono text-xs text-[#1a1a2e]">{apiKey}</code>
            <button
              onClick={copyKey}
              className="shrink-0 rounded-lg p-1.5 text-[#003856] transition hover:bg-[#003856]/5 active:scale-95"
              aria-label="Kopieren"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
