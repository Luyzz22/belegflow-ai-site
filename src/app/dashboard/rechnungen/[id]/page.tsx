"use client";
import { DuplicateAlert, AnomalyAlert, ExportButtons } from "@/components/InvoiceAlerts";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
const API = process.env.NEXT_PUBLIC_API_URL || "https://app.sbsdeutschland.com/api/erechnung";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [invoice, setInvoice] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [kontierung, setKontierung] = useState<any>(null);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [skonto, setSkonto] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    const h = { "X-Tenant-ID": user?.tenant_id || "", Authorization: "Bearer " + token };
    Promise.all([
      fetch(API + "/invoices/" + id, { headers: h }).then(r => r.json()),
      fetch(API + "/invoices/" + id + "/events", { headers: h }).then(r => r.json()).catch(() => []),
      fetch(API + "/invoices/" + id + "/kontierung", { headers: h, method: "POST" }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(API + "/invoices/" + id + "/duplicate-check", { headers: h }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(API + "/invoices/" + id + "/anomaly-check", { headers: h }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(API + "/invoices/" + id + "/skonto-check", { headers: h }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([inv, ev, ko, dup, anom, sk]) => {
      setInvoice(inv);
      setEvents(Array.isArray(ev) ? ev : ev?.events || []);
      setKontierung(ko);
      if (dup) setDuplicates(dup.duplicates || []);
      if (anom) setAnomalies(anom.anomalies || []);
      if (sk) setSkonto(sk);
    }).finally(() => setLoading(false));
  }, [token, id, user]);

  const transition = async (to: string) => {
    const h = { "Content-Type": "application/json", "X-Tenant-ID": user?.tenant_id || "", Authorization: "Bearer " + token };
    await fetch(API + "/invoices/" + id + "/transition", { method: "POST", headers: h, body: JSON.stringify({ to_state: to, actor: user?.name || "User" }) });
    window.location.reload();
  };

  if (!user) return null;
  if (loading) return <div className="flex justify-center py-20"><div className="flex gap-1.5">{[0,150,300].map(d => <div key={d} className="w-3 h-3 bg-[#e85d04] rounded-full animate-bounce" style={{ animationDelay: d + "ms" }} />)}</div></div>;
  if (!invoice) return <div className="max-w-[1400px] mx-auto px-6 py-12 text-center"><p className="text-gray-500">Rechnung nicht gefunden</p></div>;

  const amount = Number(invoice.total_amount) || 0;
  const tax = Number(invoice.tax_amount) || 0;
  const net = amount - tax || amount / 1.19;
  const sug = kontierung?.suggestion || kontierung;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/dashboard/rechnungen" className="text-gray-400 hover:text-gray-600 transition text-sm">← Zurück</a>
          <div className="h-5 w-px bg-gray-200" />
          <h1 className="text-lg font-bold text-gray-900">{invoice.invoice_number || invoice.file_name}</h1>
          <span className={"text-[10px] px-2.5 py-1 rounded-full font-bold " + (invoice.current_state === "approved" ? "bg-green-100 text-green-700" : invoice.current_state === "suggested" ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-600")}>{invoice.current_state?.toUpperCase()}</span>
        </div>
        <div className="flex gap-2">
          {["suggested", "classified", "validated"].includes(invoice.current_state) && <button onClick={() => transition("approved")} className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: "#10b981" }}>✅ Freigeben</button>}
          {invoice.current_state === "approved" && <button onClick={() => transition("exported")} className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: "#003856" }}>📤 DATEV Export</button>}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Brutto", value: amount.toLocaleString("de-DE", { style: "currency", currency: invoice.currency || "EUR" }), icon: "💰" },
          { label: "Netto", value: net.toLocaleString("de-DE", { style: "currency", currency: "EUR" }), icon: "📊" },
          { label: "MwSt.", value: tax.toLocaleString("de-DE", { style: "currency", currency: "EUR" }), icon: "🏛️" },
          { label: "Lieferant", value: invoice.supplier || "—", icon: "🏢" },
          { label: "Fällig", value: invoice.due_date || "—", icon: "📅" },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1"><span className="text-base">{k.icon}</span><span className="text-[10px] text-gray-400 uppercase tracking-wider">{k.label}</span></div>
            <p className="text-sm font-bold text-gray-900 truncate">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Skonto Radar */}
      {skonto && (skonto.skonto_detected || skonto.potential_savings > 50) && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-sm font-bold text-emerald-800">Skonto-Radar: {skonto.potential_savings?.toLocaleString("de-DE")}€ sparen</p>
              <p className="text-xs text-emerald-600">{skonto.skonto_rate}% Skonto bei Zahlung bis {skonto.skonto_deadline} ({skonto.skonto_days} Tage)</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">{skonto.skonto_detected ? "Erkannt" : "Standard"}</span>
        </div>
      )}

      {/* Alerts */}
      <DuplicateAlert duplicates={duplicates} />
      <AnomalyAlert anomalies={anomalies} />

      {/* KI-Kontierung */}
      {sug && sug.konto && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">🤖 KI-Kontierung</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-3"><p className="text-[10px] text-gray-400 uppercase">Konto</p><p className="text-lg font-bold text-[#003856]">{sug.konto}</p></div>
            <div className="bg-gray-50 rounded-xl p-3"><p className="text-[10px] text-gray-400 uppercase">Gegenkonto</p><p className="text-lg font-bold text-gray-900">{sug.gegenkonto}</p></div>
            <div className="bg-gray-50 rounded-xl p-3"><p className="text-[10px] text-gray-400 uppercase">Steuer</p><p className="text-lg font-bold text-gray-900">VSt {sug.steuerschluessel}</p></div>
            <div className="bg-gray-50 rounded-xl p-3"><p className="text-[10px] text-gray-400 uppercase">Modell</p><p className="text-sm font-medium text-gray-700">{sug.model} ({Math.round((sug.confidence || 0) * 100)}%)</p></div>
          </div>
          {sug.buchungstext && <p className="text-xs text-gray-500 mt-3 bg-gray-50 rounded-lg px-3 py-2">📝 {sug.buchungstext}</p>}
        </div>
      )}

      {/* Export Buttons */}
      <ExportButtons documentId={String(id)} token={token || ""} tenantId={user?.tenant_id || ""} />

      {/* Event Timeline */}
      {events.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">📋 Verlauf</h3>
          <div className="space-y-2">
            {events.map((ev, i) => (
              <div key={i} className="flex items-center gap-3 text-xs px-3 py-2 rounded-lg hover:bg-gray-50 transition">
                <div className="w-2 h-2 rounded-full bg-[#003856]" />
                <span className="text-gray-400 font-mono w-28">{ev.created_at ? new Date(ev.created_at).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""}</span>
                <span className="text-gray-700 font-medium">{ev.event_type?.replace(/_/g, " ")}</span>
                {ev.status_from && ev.status_to && <span className="text-gray-400">{ev.status_from} → {ev.status_to}</span>}
                <span className="text-gray-400 ml-auto">{ev.actor || "system"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Data */}
      <details className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <summary className="text-sm font-semibold text-gray-500 cursor-pointer">🔧 Rohdaten</summary>
        <pre className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-xl p-4 overflow-x-auto">{JSON.stringify(invoice, null, 2)}</pre>
      </details>
    </div>
  );
}
