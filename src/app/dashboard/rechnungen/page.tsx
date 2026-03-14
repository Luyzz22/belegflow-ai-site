"use client";
import { useAuth } from "@/lib/useAuth";

export default function RechnungenPage() {
  const { user, token } = useAuth();
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <a href="/dashboard" className="text-[#737373] hover:text-white transition">&larr; Dashboard</a>
          <div className="h-6 w-px bg-[#262626]" />
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e85d04] to-[#f48c06] flex items-center justify-center text-lg">📄</div>
            <div><h1 className="text-lg font-semibold">Rechnungen</h1><p className="text-xs text-[#737373]">Upload & Verarbeitung</p></div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <div className="bg-[#171717]/50 border border-[#262626] rounded-2xl p-12 max-w-lg mx-auto">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-xl font-semibold mb-2">Rechnung hochladen</h2>
          <p className="text-[#737373] text-sm mb-6">PDF, XML oder XRechnung — die KI verarbeitet alles in unter 3 Sekunden.</p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-[#e85d04] hover:bg-[#f48c06] rounded-xl text-sm font-medium cursor-pointer transition">
            <span>Datei auswählen</span>
            <input type="file" accept=".pdf,.xml,.png,.jpg,.jpeg" className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const fd = new FormData();
              fd.append("file", f);
              try {
                const res = await fetch("https://app.sbsdeutschland.com/api/erechnung/invoices/upload", {
                  method: "POST", headers: { "X-Tenant-ID": user.tenant_id, Authorization: "Bearer " + token }, body: fd,
                });
                if (res.ok) { const d = await res.json(); alert("Rechnung hochgeladen: " + d.document_id); }
                else { const d = await res.json(); alert("Fehler: " + (d.detail || res.status)); }
              } catch (err) { alert("Verbindungsfehler"); }
            }} />
          </label>
        </div>
      </div>
    </div>
  );
}
