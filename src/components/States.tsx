"use client";

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

export function LoadingState({ label = "Wird geladen …" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-stone-500">
      <Spinner className="h-7 w-7" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`fc-skeleton rounded-md ${className}`} />;
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white py-16 ring-1 ring-rose-200/60">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-2xl">
        ⚠️
      </div>
      <p className="text-sm font-medium text-rose-700">Etwas ist schiefgelaufen</p>
      <p className="max-w-md text-center text-sm text-stone-500">
        {message || "Die Daten konnten nicht geladen werden."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-xl bg-[#003856] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002a42]"
        >
          Erneut versuchen
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white py-16 text-center ring-1 ring-stone-200/60">
      <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-2xl">
        {icon}
      </div>
      <p className="text-sm font-semibold text-stone-800">{title}</p>
      {description && <p className="max-w-md text-sm text-stone-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
