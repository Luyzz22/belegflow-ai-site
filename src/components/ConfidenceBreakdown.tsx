"use client";

import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, type LucideIcon } from "lucide-react";
import type { ConfidenceCheck, ConfidenceResult, CheckAction, CheckStatus } from "@/lib/confidence";

const STATUS: Record<CheckStatus, { card: string; bar: string; text: string; icon: LucideIcon; iconCls: string }> = {
  pass: {
    card: "border-emerald-200 bg-emerald-50",
    bar: "bg-emerald-500",
    text: "text-emerald-700",
    icon: CheckCircle2,
    iconCls: "text-emerald-600",
  },
  warn: {
    card: "border-amber-200 bg-amber-50",
    bar: "bg-amber-500",
    text: "text-amber-700",
    icon: AlertTriangle,
    iconCls: "text-amber-600",
  },
  fail: {
    card: "border-red-200 bg-red-50",
    bar: "bg-red-500",
    text: "text-red-700",
    icon: XCircle,
    iconCls: "text-red-600",
  },
};

function CheckRow({
  check,
  delay,
  onAction,
}: {
  check: ConfidenceCheck;
  delay: number;
  onAction?: (action: CheckAction) => void;
}) {
  const s = STATUS[check.status];
  const Icon = s.icon;
  const pctFilled = Math.round((check.earnedPoints / check.maxPoints) * 100);

  return (
    <div
      className={`fc-rise rounded-xl border p-3.5 ${s.card}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${s.iconCls}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#1a1a2e]">{check.label}</p>
            <span className={`shrink-0 font-mono text-xs ${s.text}`}>
              +{check.earnedPoints}/{check.maxPoints}
            </span>
          </div>

          {/* Fortschrittsbalken */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${s.bar}`}
              style={{ width: `${pctFilled}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-[#64748b]">{check.detail}</p>
          {check.hint && check.status !== "pass" && (
            <p className={`mt-1 text-xs font-medium ${s.text}`}>{check.hint}</p>
          )}

          {check.action && onAction && (
            <button
              onClick={() => onAction(check.action!)}
              className={`mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition active:scale-95 ${s.text} hover:bg-black/5`}
            >
              {check.action === "kontierung" ? "Kontierung ergänzen" : "Im Beleg ergänzen"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Apple-Health-artige Aufschlüsselung der Konfidenz-Prüfpunkte. */
export default function ConfidenceBreakdown({
  result,
  onAction,
  onlyIssues = false,
  title = "Prüfungsergebnis",
}: {
  result: ConfidenceResult;
  onAction?: (action: CheckAction) => void;
  onlyIssues?: boolean;
  title?: string;
}) {
  const checks = onlyIssues ? result.checks.filter((c) => c.status !== "pass") : result.checks;
  if (checks.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-5 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1a1a2e]">{title}</h3>
        <span className="text-sm font-bold text-[#003856]">Score: {result.score}%</span>
      </div>
      <div className="space-y-2.5">
        {checks.map((c, i) => (
          <CheckRow key={c.id} check={c} delay={i * 50} onAction={onAction} />
        ))}
      </div>
    </div>
  );
}
