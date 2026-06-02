import type { InvoiceStatus } from "@/lib/api-client";

const MAP: Record<string, { label: string; cls: string }> = {
  neu: { label: "Neu", cls: "bg-slate-100 text-slate-700 ring-slate-200" },
  verarbeitet: { label: "Verarbeitet", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  freigegeben: { label: "Freigegeben", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  exportiert: { label: "Exportiert", cls: "bg-[#c8985a]/15 text-[#8a6526] ring-[#c8985a]/30" },
  offen: { label: "Offen", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  genehmigt: { label: "Genehmigt", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  abgelehnt: { label: "Abgelehnt", cls: "bg-rose-50 text-rose-700 ring-rose-200" },
};

export default function StatusBadge({ status }: { status: InvoiceStatus | string }) {
  const key = (status || "").toLowerCase();
  const cfg = MAP[key] || { label: status || "—", cls: "bg-slate-100 text-slate-700 ring-slate-200" };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}
