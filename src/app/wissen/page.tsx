import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, ListChecks, AlertTriangle, GitCompare, ArrowRight } from "lucide-react";
import PublicPage from "@/components/PublicPage";
import { ToolCta, Disclaimer, JsonLd, SITE } from "@/components/wissen/parts";

export const metadata: Metadata = {
  title: "E-Rechnung Wissen — XRechnung, ZUGFeRD & EN 16931 verständlich erklärt",
  description:
    "Der Wissens-Hub zur E-Rechnung: E-Rechnungspflicht 2025–2028, häufige XRechnung-Fehler, Prüfkatalog (EN 16931) und Formatvergleich — verständlich und mit kostenlosem Prüf-Tool.",
  keywords: ["E-Rechnung", "XRechnung", "ZUGFeRD", "EN 16931", "E-Rechnungspflicht", "E-Rechnung Wissen"],
  alternates: { canonical: "/wissen" },
  openGraph: {
    title: "E-Rechnung Wissen — XRechnung, ZUGFeRD & EN 16931",
    description: "E-Rechnungspflicht, XRechnung-Fehler und Prüfkatalog verständlich erklärt — inkl. kostenlosem Prüf-Tool.",
    url: "/wissen",
    type: "website",
  },
};

const TOPICS = [
  {
    href: "/wissen/e-rechnungspflicht",
    icon: CalendarClock,
    title: "E-Rechnungspflicht 2025–2028",
    desc: "Fristen, wer betroffen ist, Ausnahmen und Aufbewahrung — kompakt nach aktueller Rechtslage.",
  },
  {
    href: "/wissen/xrechnung-fehler",
    icon: AlertTriangle,
    title: "Häufige XRechnung-Fehler",
    desc: "Die wichtigsten EN-16931-Geschäftsregeln (BR-Codes) in Klartext — mit Ursache und Lösung.",
  },
  {
    href: "/wissen/pruefkatalog",
    icon: ListChecks,
    title: "Was wird geprüft?",
    desc: "Die drei Prüfebenen Syntax, Schema und Geschäftsregeln — und was „valide“ wirklich bedeutet.",
  },
  {
    href: "/wissen/xrechnung-vs-zugferd",
    icon: GitCompare,
    title: "XRechnung vs. ZUGFeRD",
    desc: "Reines XML oder Hybrid-PDF? Der kurze Formatvergleich für die Praxis.",
  },
];

export default function WissenPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "E-Rechnung Wissen",
        inLanguage: "de-DE",
        mainEntityOfPage: `${SITE}/wissen`,
        description: "Wissens-Hub zur E-Rechnung: Pflicht, Fehler, Prüfkatalog und Formate.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [{ "@type": "ListItem", position: 1, name: "Wissen", item: `${SITE}/wissen` }],
      },
    ],
  };

  return (
    <PublicPage
      title="E-Rechnung — Wissen & Ratgeber"
      subtitle="Alles zur elektronischen Rechnung nach EN 16931: Pflichten, Fristen, häufige Fehler und wie die Validierung funktioniert. Verständlich erklärt — und direkt prüfbar."
    >
      <JsonLd data={jsonLd} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {TOPICS.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="group flex flex-col rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,56,86,0.06)] transition-all hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#003856]/5 text-[#003856]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-[#1a1a2e]">{t.title}</h2>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[#64748b]">{t.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#003856] transition-all group-hover:gap-2">
                Mehr erfahren <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
      </div>

      <ToolCta />
      <Disclaimer />
    </PublicPage>
  );
}
