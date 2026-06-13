"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  upload: "Upload",
  review: "Review",
  rechnungen: "Rechnungen",
  freigaben: "Freigaben",
  lieferanten: "Lieferanten",
  export: "DATEV-Export",
  zahlungen: "Zahlungen",
  audit: "Audit-Trail",
  analytics: "Analytics",
  roi: "ROI",
  "compliance-center": "Compliance",
  report: "Wochenbericht",
  einstellungen: "Einstellungen",
  profil: "Profil",
};

function labelFor(segment: string): string {
  return ROUTE_LABELS[segment] || decodeURIComponent(segment);
}

/** Breadcrumb-Navigation, automatisch aus dem Pfad abgeleitet.
 *  `lastLabel` überschreibt das letzte Segment (z. B. Rechnungsnummer/Name). */
export default function Breadcrumbs({ lastLabel }: { lastLabel?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return null; // auf /dashboard keine Breadcrumb

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;
    const label = isLast && lastLabel ? lastLabel : labelFor(seg);
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-[#64748b] print:hidden">
      <Link href="/dashboard" className="transition hover:text-[#003856]">
        Dashboard
      </Link>
      {crumbs.map((c) => (
        <Fragment key={c.href}>
          <ChevronRight className="h-3.5 w-3.5 text-[#94a3b8]" />
          {c.isLast ? (
            <span className="font-medium text-[#1a1a2e]">{c.label}</span>
          ) : (
            <Link href={c.href} className="transition hover:text-[#003856]">
              {c.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
