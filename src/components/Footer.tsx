import Link from "next/link";
import { LogoMark } from "@/components/Brand";

const COLS: { title: string; links: [string, string][] }[] = [
  {
    title: "Produkt",
    links: [
      ["/preise", "Preise"],
      ["/sicherheit", "Sicherheit"],
      ["/compliance", "Compliance"],
      ["/register", "Kostenlos testen"],
    ],
  },
  {
    title: "Unternehmen",
    links: [
      ["/kontakt", "Kontakt"],
      ["/impressum", "Impressum"],
      ["/avv", "AVV"],
    ],
  },
  {
    title: "Rechtliches",
    links: [
      ["/datenschutz", "Datenschutz"],
      ["/agb", "AGB"],
      ["/compliance", "EU AI Act"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <LogoMark className="h-8 w-8" />
              <span className="text-base font-semibold tracking-tight text-[#003856]">
                FlowCheck <span className="text-[#c8985a]">AI+</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-stone-500">
              KI-native Rechnungsverarbeitung für den deutschen Mittelstand.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                {col.title}
              </h4>
              <div className="flex flex-col gap-2">
                {col.links.map(([h, l]) => (
                  <Link key={h + l} href={h} className="text-sm text-stone-600 transition hover:text-[#003856]">
                    {l}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-stone-200 pt-6 sm:flex-row">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} FlowCheck AI+ — Ein Produkt der SBS Deutschland GmbH &amp; Co. KG
          </p>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span>🇩🇪 Hosting Deutschland</span>
            <span aria-hidden>·</span>
            <span>🔒 DSGVO-konform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
