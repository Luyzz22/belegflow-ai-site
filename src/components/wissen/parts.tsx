import Link from "next/link";
import { ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";

export const STAND = "Juni 2026";
export const SITE = "https://belegflow-ai.de";

// ── Prose-Primitive (manuelles, lesbares Long-Form-Styling) ──
export function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mt-12 scroll-mt-24 text-2xl font-semibold tracking-tight text-[#003856]">
      {children}
    </h2>
  );
}
export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 text-lg font-semibold text-[#1a1a2e]">{children}</h3>;
}
export function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 leading-relaxed text-[#475569]">{children}</p>;
}
export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="mt-3 space-y-2">{children}</ul>;
}
export function LI({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 leading-relaxed text-[#475569]">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c8985a]" />
      <span>{children}</span>
    </li>
  );
}
export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border-l-4 border-[#c8985a] bg-[#faf9f7] p-5 text-sm leading-relaxed text-[#475569]">
      {children}
    </div>
  );
}

// ── Sichtbare Breadcrumb (Wissen > Artikel) ──
export function Breadcrumb({ title }: { title?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-[#64748b]">
      <Link href="/wissen" className="transition hover:text-[#003856]">
        Wissen
      </Link>
      {title && (
        <>
          <ChevronRight className="h-3.5 w-3.5 text-[#94a3b8]" />
          <span className="font-medium text-[#1a1a2e]">{title}</span>
        </>
      )}
    </nav>
  );
}

// ── CTA-Block zum Prüf-Tool ──
export function ToolCta() {
  return (
    <div className="mt-12 rounded-2xl bg-[#003856] p-6 text-white sm:p-8">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#c8985a]" />
        <div>
          <h2 className="text-lg font-semibold">E-Rechnung jetzt kostenlos prüfen</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/75">
            Laden Sie eine XRechnung-XML oder ein ZUGFeRD-/Factur-X-PDF hoch — ohne Anmeldung. Sie erhalten sofort das
            Validierungsergebnis gegen EN 16931 mit verständlicher Fehlerliste.
          </p>
          <Link
            href="/e-rechnung-pruefen"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FFB900] px-6 py-3 text-sm font-bold text-[#003856] transition-all hover:bg-[#e6a800] active:scale-95"
          >
            Zum E-Rechnungs-Check <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Disclaimer + Stand-Datum ──
export function Disclaimer() {
  return (
    <p className="mt-10 border-t border-[rgba(0,56,86,0.08)] pt-6 text-xs leading-relaxed text-[#94a3b8]">
      Stand: {STAND}. Allgemeine Information, keine Rechts- oder Steuerberatung. Maßgeblich sind die jeweils geltenden
      gesetzlichen Regelungen; bei Detailfragen wenden Sie sich an das Bundesministerium der Finanzen (BMF) oder Ihre
      Steuerberatung.
    </p>
  );
}

// ── JSON-LD-Graph (Article + BreadcrumbList + optional FAQPage) ──
export function articleGraph({
  title,
  description,
  slug,
  faq,
}: {
  title: string;
  description: string;
  slug: string;
  faq?: { q: string; a: string }[];
}) {
  const url = `${SITE}${slug}`;
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      headline: title,
      description,
      inLanguage: "de-DE",
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: "SBS Deutschland GmbH & Co. KG" },
      publisher: { "@type": "Organization", name: "FlowCheck AI+" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Wissen", item: `${SITE}/wissen` },
        { "@type": "ListItem", position: 2, name: title, item: url },
      ],
    },
  ];
  if (faq && faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
