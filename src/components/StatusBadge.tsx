import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Download,
  AlertTriangle,
  Clock,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";
import type { InvoiceStatus } from "@/lib/api-client";

const MAP: Record<string, { label: string; cls: string; icon: LucideIcon }> = {
  neu: { label: "Neu", cls: "bg-blue-50 text-blue-700 ring-blue-200", icon: Sparkles },
  verarbeitet: { label: "Verarbeitet", cls: "bg-amber-50 text-amber-700 ring-amber-200", icon: CheckCircle2 },
  freigegeben: { label: "Freigegeben", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: ShieldCheck },
  exportiert: { label: "Exportiert", cls: "bg-slate-100 text-slate-600 ring-slate-200", icon: Download },
  fehler: { label: "Fehler", cls: "bg-red-50 text-red-700 ring-red-200", icon: AlertTriangle },
  offen: { label: "Offen", cls: "bg-amber-50 text-amber-700 ring-amber-200", icon: Clock },
  ausstehend: { label: "Ausstehend", cls: "bg-amber-50 text-amber-700 ring-amber-200", icon: Clock },
  genehmigt: { label: "Genehmigt", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: Check },
  abgelehnt: { label: "Abgelehnt", cls: "bg-red-50 text-red-700 ring-red-200", icon: X },
};

export default function StatusBadge({ status }: { status: InvoiceStatus | string }) {
  const key = (status || "").toLowerCase();
  const cfg = MAP[key];
  const Icon = cfg?.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${
        cfg?.cls || "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {cfg?.label || status || "—"}
    </span>
  );
}
