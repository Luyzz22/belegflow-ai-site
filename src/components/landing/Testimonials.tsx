import { Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "FlowCheck hat unsere Rechnungsbearbeitung von 8 Minuten auf unter eine Minute reduziert. Die Zeitersparnis ist enorm.",
    name: "M. Hoffmann",
    role: "Leiter Finanzbuchhaltung",
  },
  {
    quote:
      "Endlich eine Software, die XRechnung und PDF gleichzeitig versteht. Der DATEV-Export funktioniert einwandfrei.",
    name: "S. Weber",
    role: "Steuerfachangestellte",
  },
  {
    quote:
      "Die KI-Extraktion war sofort einsatzbereit — ohne Einrichtung, ohne Schulung. Unsere Buchhaltung spart 2 Stunden pro Tag.",
    name: "Dr. K. Meyer",
    role: "Geschäftsführer",
  },
];

const LOGOS = ["Mittelstand AG", "Digital Solutions GmbH", "Nordhandel KG", "Rheinwerk GmbH", "Alpina Industrie"];

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="mb-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#c8985a]">Kundenstimmen</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1a1a2e]">Was unsere Kunden sagen</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="flex flex-col rounded-2xl border border-[rgba(0,56,86,0.08)] bg-white p-7 shadow-[0_1px_3px_rgba(0,56,86,0.06)]">
            <Quote className="h-7 w-7 text-[#c8985a]" />
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-[#1a1a2e]">{t.quote}</blockquote>
            <div className="mt-5">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#FFB900] text-[#FFB900]" />
                ))}
              </div>
              <figcaption className="mt-2 text-sm font-semibold text-[#1a1a2e]">
                {t.name}
                <span className="block text-xs font-normal text-[#64748b]">{t.role}</span>
              </figcaption>
            </div>
          </figure>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-[#94a3b8]">Kundenstimmen anonymisiert.</p>

      {/* Logo-Leiste (Platzhalter) */}
      <div className="mt-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Vertraut von Unternehmen im DACH-Raum</p>
        <div
          className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
          title="Kundenlogos werden nach Freigabe angezeigt"
        >
          {LOGOS.map((l) => (
            <span key={l} className="text-base font-semibold text-stone-300">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
