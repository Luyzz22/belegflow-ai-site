"use client";

import { useCallback, useEffect, useState } from "react";
import { Webhook as WebhookIcon, Plus, Send, Trash2, Download, Copy, ArrowRight } from "lucide-react";
import { flowcheckApi, ApiError, type Webhook, type WebhookEvent } from "@/lib/api-client";
import { dateDE } from "@/lib/format";
import { n8nTemplates, TEMPLATE_META } from "@/lib/n8n-templates";
import { LoadingState } from "@/components/States";
import { useToast } from "@/components/toast/ToastProvider";

const CARD = "rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)]";

const EVENTS: { id: WebhookEvent; label: string }[] = [
  { id: "invoice.processed", label: "invoice.processed — Rechnung verarbeitet" },
  { id: "invoice.approved", label: "invoice.approved — Rechnung freigegeben" },
  { id: "invoice.rejected", label: "invoice.rejected — Rechnung abgelehnt" },
  { id: "export.completed", label: "export.completed — DATEV-Export durchgeführt" },
];

const SETUP_STEPS: { title: string; body?: string; code?: string }[] = [
  { title: "1. n8n installieren", body: "Self-hosted via Docker oder n8n.io Cloud (gehostet).", code: "docker run -d --name n8n -p 5678:5678 n8nio/n8n" },
  { title: "2. Workflow importieren", body: "Template herunterladen, dann in n8n: Menü → Import from File. Anschließend Credentials konfigurieren (FlowCheck-Token, E-Mail, Slack)." },
  { title: "3. Webhook in FlowCheck eintragen", body: "n8n-Webhook-URL kopieren und oben unter „Webhook hinzufügen“ eintragen, dann Test-Event senden." },
  { title: "4. Aktivieren", body: "In n8n den Workflow auf „Active“ stellen — fertig! ✅" },
];

function downloadJson(name: string, data: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function WebhooksPanel() {
  const { addToast } = useToast();
  const [items, setItems] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [events, setEvents] = useState<WebhookEvent[]>(["invoice.processed", "invoice.approved", "invoice.rejected"]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    flowcheckApi
      .webhooks()
      .then((r) => setItems(r.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleEvent = (id: WebhookEvent) =>
    setEvents((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));

  const create = () => {
    if (!url.trim()) {
      addToast({ type: "error", text: "Bitte eine URL angeben." });
      return;
    }
    setBusy(true);
    flowcheckApi
      .createWebhook({ url: url.trim(), secret: secret.trim() || undefined, events })
      .then(() => {
        addToast({ type: "success", text: "Webhook erstellt" });
        setShowForm(false);
        setUrl("");
        setSecret("");
        setLoading(true);
        load();
      })
      .catch((e) => addToast({ type: "error", text: e instanceof ApiError ? e.message : "Webhook konnte nicht erstellt werden." }))
      .finally(() => setBusy(false));
  };

  const test = (target: string) => {
    flowcheckApi
      .testWebhook(target)
      .then(() => addToast({ type: "success", text: "Test-Event gesendet ✅" }))
      .catch((e) => addToast({ type: "error", text: e instanceof ApiError ? e.message : "Test fehlgeschlagen." }));
  };

  const remove = (w: Webhook) => {
    if (!window.confirm(`Webhook löschen?\n${w.url}`)) return;
    flowcheckApi
      .deleteWebhook(w.id)
      .then(() => {
        addToast({ type: "success", text: "Webhook gelöscht" });
        setItems((prev) => prev.filter((x) => x.id !== w.id));
      })
      .catch((e) => addToast({ type: "error", text: e instanceof ApiError ? e.message : "Löschen fehlgeschlagen." }));
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(
      () => addToast({ type: "success", text: "Kopiert" }),
      () => addToast({ type: "error", text: "Kopieren fehlgeschlagen" })
    );
  };

  return (
    <div className="space-y-6">
      {/* Aktive Webhooks */}
      <section className={CARD}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-[#1a1a2e]">
            <WebhookIcon className="h-5 w-5 text-[#003856]" /> Aktive Webhooks
          </h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#003856] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002a42] active:scale-95"
          >
            <Plus className="h-4 w-4" /> Webhook hinzufügen
          </button>
        </div>

        {showForm && (
          <div className="mb-5 rounded-xl border border-[rgba(0,56,86,0.1)] bg-[#faf9f7] p-4">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#64748b]">URL (Pflicht)</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://n8n.example.com/webhook/flowcheck-invoice"
              className="w-full rounded-xl border border-[rgba(0,56,86,0.12)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
            />
            <label className="mb-1 mt-3 block text-xs font-medium uppercase tracking-wider text-[#64748b]">Secret (optional, für HMAC)</label>
            <input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full rounded-xl border border-[rgba(0,56,86,0.12)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#003856] focus:ring-2 focus:ring-[#003856]/20"
            />
            <p className="mb-1.5 mt-3 text-xs font-medium uppercase tracking-wider text-[#64748b]">Events</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {EVENTS.map((ev) => (
                <label key={ev.id} className="flex items-center gap-2.5 text-sm text-[#1a1a2e]">
                  <input
                    type="checkbox"
                    checked={events.includes(ev.id)}
                    onChange={() => toggleEvent(ev.id)}
                    className="h-4 w-4 rounded border-stone-300 text-[#003856] focus:ring-[#003856]"
                  />
                  {ev.label}
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={create}
                disabled={busy}
                className="rounded-xl bg-[#003856] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#002a42] active:scale-95 disabled:opacity-60"
              >
                Erstellen
              </button>
              <button onClick={() => setShowForm(false)} className="rounded-xl px-5 py-2 text-sm font-medium text-[#64748b] transition hover:bg-[#faf9f7]">
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingState label="Webhooks werden geladen …" />
        ) : items.length === 0 ? (
          <p className="text-sm text-[#64748b]">Keine Webhooks konfiguriert.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,56,86,0.06)] text-left text-xs font-medium uppercase tracking-wider text-[#64748b]">
                  <th className="px-3 py-2.5">URL</th>
                  <th className="px-3 py-2.5">Events</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Erstellt</th>
                  <th className="px-3 py-2.5 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,56,86,0.06)]">
                {items.map((w) => (
                  <tr key={w.id} className="transition hover:bg-stone-50">
                    <td className="max-w-[220px] truncate px-3 py-3 font-mono text-xs text-[#1a1a2e]" title={w.url}>{w.url}</td>
                    <td className="px-3 py-3 text-xs text-[#64748b]">{(w.events || []).join(", ")}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <span className={`h-2 w-2 rounded-full ${w.active === false ? "bg-red-500" : "bg-emerald-500"}`} />
                        {w.active === false ? "Inaktiv" : "Aktiv"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-[#64748b]">{w.created_at ? dateDE(w.created_at) : "—"}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => test(w.url)} className="inline-flex items-center gap-1 rounded-lg bg-[#003856] px-2.5 py-1 text-xs font-medium text-white transition hover:bg-[#002a42]">
                          <Send className="h-3.5 w-3.5" /> Test
                        </button>
                        <button onClick={() => remove(w)} aria-label="Löschen" className="rounded-lg p-1 text-red-500 transition hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* n8n Templates */}
      <section>
        <h2 className="text-xl font-semibold text-[#1a1a2e]">n8n Workflow-Templates</h2>
        <p className="mb-4 mt-1 text-sm text-[#64748b]">Fertige Workflows für n8n — mit einem Klick importierbar.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {TEMPLATE_META.map((tpl) => (
            <div key={tpl.key} className={`${CARD} transition hover:shadow-md`}>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{tpl.icon}</span>
                <h3 className="text-base font-semibold text-[#1a1a2e]">{tpl.title}</h3>
              </div>
              <p className="mt-2 text-sm text-[#64748b]">{tpl.desc}</p>
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {tpl.steps.map((s, i) => (
                  <span key={s} className="flex items-center gap-1.5">
                    {i > 0 && <ArrowRight className="h-3.5 w-3.5 text-[#c8985a]" />}
                    <span className="rounded-lg bg-[#faf9f7] px-2 py-1 text-xs text-[#1a1a2e]">{s}</span>
                  </span>
                ))}
              </div>
              <button
                onClick={() => downloadJson(tpl.filename, n8nTemplates[tpl.key])}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#003856] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002a42] active:scale-95"
              >
                <Download className="h-4 w-4" /> Template herunterladen (JSON)
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Setup-Anleitung */}
      <section className={CARD}>
        <h2 className="mb-4 text-xl font-semibold text-[#1a1a2e]">So verbinden Sie FlowCheck mit n8n</h2>
        <ol className="space-y-4">
          {SETUP_STEPS.map((step) => (
            <li key={step.title}>
              <p className="text-sm font-semibold text-[#1a1a2e]">{step.title}</p>
              {step.body && <p className="mt-0.5 text-sm text-[#64748b]">{step.body}</p>}
              {step.code && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-stone-100 px-3 py-2">
                  <code className="flex-1 overflow-x-auto font-mono text-xs text-[#1a1a2e]">{step.code}</code>
                  <button onClick={() => copy(step.code as string)} aria-label="Befehl kopieren" className="shrink-0 rounded p-1 text-[#64748b] transition hover:text-[#003856]">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
