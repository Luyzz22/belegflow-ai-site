import Link from "next/link";

const BADGES = [
  "🇩🇪 Deutsche Server",
  "🔒 DSGVO-konform",
  "📋 GoBD-ready",
  "🤖 EU AI Act",
  "🛡️ NIS2-bereit",
];

/** Vertrauensleiste mit Compliance-Kurzhinweisen, verlinkt aufs Trust Center. */
export default function TrustBadges({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/trust"
      title="Zum Trust Center"
      className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-[#64748b] transition hover:text-[#003856] print:hidden ${className}`}
    >
      {BADGES.map((b, i) => (
        <span key={b} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden className="text-[#cbd5e1]">·</span>}
          {b}
        </span>
      ))}
    </Link>
  );
}
