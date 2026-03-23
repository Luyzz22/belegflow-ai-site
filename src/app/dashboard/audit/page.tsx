"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import RoleGate from "@/components/RoleGate";

const API = process.env.NEXT_PUBLIC_API_URL || "https://app.sbsdeutschland.com/api/erechnung";

type AuditEvent = {
  event_type: string;
  created_at?: string;
  document_id?: string;
  supplier?: string;
  file_name?: string;
  status_from?: string;
  status_to?: string;
  actor?: string;
  details?: unknown;
};

const EVENT_ICONS: Record<string, string> = {
  upload_received: "⬆️",
  format_classified: "🏷️",
  ai_extraction_completed: "🤖",
  validation_completed: "✅",
  validation_skipped: "⏭️",
  transition_completed: "🔄",
  kontierung_suggested: "📊",
  kontierung_corrected: "✏️",
  approval_granted: "✅",
  approval_rejected: "⛔",
  datev_exported: "📤",
  xrechnung_generated: "📄",
};

const EVENT_LABELS: Record<string, string> = {
  upload_received: "Upload empfangen",
  format_classified: "Format erkannt",
  ai_extraction_completed: "KI-Extraktion abgeschlossen",
  validation_completed: "Validierung abgeschlossen",
  validation_skipped: "Validierung übersprungen",
  transition_completed: "Statuswechsel",
  kontierung_suggested: "KI-Vorschlag erzeugt",
  kontierung_corrected: "Vorschlag korrigiert",
  approval_granted: "Freigabe erteilt",
  approval_rejected: "Freigabe abgelehnt",
  datev_exported: "DATEV-kompatibler Export",
  xrechnung_generated: "XRechnung erzeugt",
};

export default function AuditLogPage() {
  const { user, token } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API}/audit-log?limit=50&offset=${page * 50}`, {
          headers: { Authorization: `Bearer ${token}`, "X-Tenant-ID": user?.tenant_id || "" },
        });
        if (!response.ok) {
          setError("Audit-Ereignisse konnten nicht geladen werden.");
          setLoading(false);
          return;
        }

        const data = await response.json();
        setEvents((data.events || []) as AuditEvent[]);
        setTotal(Number(data.total || 0));
      } catch {
        setError("Audit-Ereignisse konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [token, user, page]);

  if (!user) return null;

  return (
    <RoleGate user={user} allowedRoles={["admin", "editor"]} areaLabel="Audit-Log">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Audit-Log</h1>
            <p className="text-sm text-gray-500">{total} Ereignisse gesamt</p>
          </div>
        </div>
        <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-700">
          GoBD-orientierte Prüfspur: Statuswechsel, KI-Vorschläge, Korrekturen, Freigaben und Exporte sind als Audit-Ereignisse nachvollziehbar.
        </div>
        {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
        {loading ? (
          <div className="flex justify-center py-20"><div className="flex gap-1.5">{[0, 150, 300].map(d => <div key={d} className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}</div></div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] text-gray-400 uppercase tracking-widest font-medium border-b border-gray-100 bg-gray-50">
              <div className="col-span-1">Zeit</div><div className="col-span-2">Event</div><div className="col-span-3">Dokument</div><div className="col-span-2">Von → Nach</div><div className="col-span-2">Akteur</div><div className="col-span-2">Details</div>
            </div>
            {events.map((e, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-50 hover:bg-gray-50 transition items-center text-sm">
                <div className="col-span-1 text-xs text-gray-400 font-mono">{e.created_at ? new Date(e.created_at).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}</div>
                <div className="col-span-2 flex items-center gap-1.5"><span>{EVENT_ICONS[e.event_type] || "📋"}</span><span className="text-gray-700 text-xs font-medium truncate">{EVENT_LABELS[e.event_type] || e.event_type.replace(/_/g, " ")}</span></div>
                <div className="col-span-3"><a href={`/dashboard/rechnungen/${e.document_id}`} className="text-[#003856] hover:text-[#e85d04] text-xs font-medium truncate block">{e.supplier || e.file_name || e.document_id?.slice(0, 12)}</a></div>
                <div className="col-span-2 text-xs">{e.status_from && e.status_to ? <span><span className="text-gray-400">{e.status_from}</span> → <span className="text-gray-700 font-medium">{e.status_to}</span></span> : <span className="text-gray-300">—</span>}</div>
                <div className="col-span-2 text-xs text-gray-500 truncate">{e.actor || "system"}</div>
                <div className="col-span-2 text-xs text-gray-400 truncate">{typeof e.details === "object" && e.details ? "Detailobjekt vorhanden" : "—"}</div>
              </div>
            ))}
            {events.length === 0 && <div className="px-6 py-12 text-center text-gray-400 text-sm">Noch keine Audit-Events</div>}
            {total > 50 && (
              <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-t border-gray-100">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-30">← Zurück</button>
                <span className="text-xs text-gray-400">{page * 50 + 1}–{Math.min((page + 1) * 50, total)} von {total}</span>
                <button onClick={() => setPage(page + 1)} disabled={(page + 1) * 50 >= total} className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-30">Weiter →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </RoleGate>
  );
}
