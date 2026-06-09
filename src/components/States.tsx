"use client";

import { AlertTriangle, Inbox, RotateCw } from "lucide-react";

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={`animate-spin text-[#003856] ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`fc-skeleton rounded-md ${className}`} />;
}

/** Pulsierende Tabellen-Platzhalter (wie KanzleiAI). */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white">
      <div className="border-b border-[rgba(0,56,86,0.06)] px-5 py-4">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-[rgba(0,56,86,0.06)]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-5 py-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className={`h-4 ${c === 0 ? "w-1/4" : "flex-1"}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** KPI-/Karten-Platzhalter. */
export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-8 w-20" />
          <Skeleton className="mt-3 h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function LoadingState({ label = "Wird geladen …" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-[#64748b]">
      <Spinner className="h-7 w-7" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200/70 bg-white py-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-red-700">Etwas ist schiefgelaufen</p>
      <p className="max-w-md text-center text-sm text-[#64748b]">
        {message || "Daten konnten nicht geladen werden."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 rounded-xl bg-[#003856] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#002a42]"
        >
          <RotateCw className="h-4 w-4" />
          Erneut versuchen
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white py-16 text-center">
      <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#003856]/5 text-[#003856]">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <p className="text-sm font-semibold text-[#1a1a2e]">{title}</p>
      {description && <p className="max-w-md text-sm text-[#64748b]">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
